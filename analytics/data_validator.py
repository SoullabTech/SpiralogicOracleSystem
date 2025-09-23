"""
Data Validation Pipeline for Beta Analytics
Ensures data quality and statistical validity before analysis
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any
from datetime import datetime, timedelta
from pathlib import Path
import json


class DataValidator:
    """Validates beta data quality and identifies issues before analysis"""

    def __init__(self, supabase_client):
        self.supabase = supabase_client
        self.validation_report = []
        self.critical_thresholds = {
            'min_conversations': 10,
            'min_users': 5,
            'max_firewall_imbalance': 0.2,
            'max_duplicate_rate': 0.05,
            'min_data_completeness': 0.8,
            'max_outlier_rate': 0.1
        }

    def validate_week_data(self, week_num: int, data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """
        Comprehensive validation of weekly data
        Returns dict with validation status and any issues found
        """
        self.validation_report = []
        validation_results = {
            'valid': True,
            'warnings': [],
            'errors': [],
            'stats': {},
            'recommendations': []
        }

        # 1. Check data completeness
        completeness = self._check_data_completeness(data)
        validation_results['stats']['completeness'] = completeness

        if completeness < self.critical_thresholds['min_data_completeness']:
            validation_results['errors'].append(
                f"Data completeness ({completeness:.1%}) below minimum threshold"
            )
            validation_results['valid'] = False

        # 2. Check conversation volume
        conversation_count = self._get_conversation_count(data)
        validation_results['stats']['conversation_count'] = conversation_count

        if conversation_count < self.critical_thresholds['min_conversations']:
            validation_results['warnings'].append(
                f"Low conversation count ({conversation_count}) - results may not be statistically valid"
            )

        # 3. Check user diversity
        unique_users = self._get_unique_users(data)
        validation_results['stats']['unique_users'] = unique_users

        if unique_users < self.critical_thresholds['min_users']:
            validation_results['errors'].append(
                f"Insufficient unique users ({unique_users}) for meaningful analysis"
            )
            validation_results['valid'] = False

        # 4. Check for duplicate sessions
        duplicate_rate = self._check_duplicates(data)
        validation_results['stats']['duplicate_rate'] = duplicate_rate

        if duplicate_rate > self.critical_thresholds['max_duplicate_rate']:
            validation_results['errors'].append(
                f"High duplicate session rate ({duplicate_rate:.1%}) detected"
            )
            validation_results['valid'] = False

        # 5. Check firewall assignment balance
        firewall_balance = self._check_firewall_balance(data)
        validation_results['stats']['firewall_balance'] = firewall_balance

        if abs(firewall_balance['imbalance']) > self.critical_thresholds['max_firewall_imbalance']:
            validation_results['warnings'].append(
                f"Firewall assignment imbalanced: {firewall_balance['strict']:.0f}% strict, "
                f"{firewall_balance['loose']:.0f}% loose"
            )

        # 6. Check for data anomalies
        anomalies = self._detect_anomalies(data)
        validation_results['stats']['anomaly_rate'] = anomalies['rate']

        if anomalies['rate'] > self.critical_thresholds['max_outlier_rate']:
            validation_results['warnings'].append(
                f"High anomaly rate ({anomalies['rate']:.1%}) - {anomalies['description']}"
            )

        # 7. Check temporal consistency
        temporal_issues = self._check_temporal_consistency(data, week_num)
        if temporal_issues:
            validation_results['warnings'].extend(temporal_issues)

        # 8. Validate breakthrough detection
        breakthrough_validity = self._validate_breakthrough_detection(data)
        validation_results['stats']['breakthrough_validity'] = breakthrough_validity

        if breakthrough_validity['suspicious']:
            validation_results['warnings'].append(
                f"Breakthrough detection may be over-sensitive: {breakthrough_validity['reason']}"
            )

        # 9. Generate recommendations
        validation_results['recommendations'] = self._generate_recommendations(validation_results)

        # 10. Calculate overall data quality score
        validation_results['quality_score'] = self._calculate_quality_score(validation_results)

        return validation_results

    def _check_data_completeness(self, data: Dict[str, pd.DataFrame]) -> float:
        """Check percentage of required fields that have data"""
        required_tables = ['sessions', 'consciousness', 'breakthroughs', 'firewall']
        present_tables = sum(1 for table in required_tables if table in data and not data[table].empty)
        return present_tables / len(required_tables)

    def _get_conversation_count(self, data: Dict[str, pd.DataFrame]) -> int:
        """Get total number of conversations"""
        if 'sessions' in data and not data['sessions'].empty:
            return len(data['sessions'])
        return 0

    def _get_unique_users(self, data: Dict[str, pd.DataFrame]) -> int:
        """Count unique users in dataset"""
        if 'sessions' in data and not data['sessions'].empty and 'user_id' in data['sessions']:
            return data['sessions']['user_id'].nunique()
        return 0

    def _check_duplicates(self, data: Dict[str, pd.DataFrame]) -> float:
        """Check for duplicate sessions"""
        if 'sessions' not in data or data['sessions'].empty:
            return 0.0

        df = data['sessions']
        if 'session_id' in df:
            duplicate_count = df['session_id'].duplicated().sum()
            return duplicate_count / len(df)
        return 0.0

    def _check_firewall_balance(self, data: Dict[str, pd.DataFrame]) -> Dict[str, float]:
        """Check balance of firewall A/B test assignments"""
        if 'firewall' not in data or data['firewall'].empty:
            return {'strict': 50.0, 'loose': 50.0, 'imbalance': 0.0}

        df = data['firewall']
        if 'condition' in df:
            counts = df['condition'].value_counts(normalize=True)
            strict_pct = counts.get('strict', 0) * 100
            loose_pct = counts.get('loose', 0) * 100
            imbalance = abs(strict_pct - loose_pct) / 100
            return {
                'strict': strict_pct,
                'loose': loose_pct,
                'imbalance': imbalance
            }
        return {'strict': 50.0, 'loose': 50.0, 'imbalance': 0.0}

    def _detect_anomalies(self, data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """Detect statistical anomalies in the data"""
        anomalies = {
            'rate': 0.0,
            'description': '',
            'details': []
        }

        # Check for outliers in session duration
        if 'sessions' in data and not data['sessions'].empty:
            if 'duration_minutes' in data['sessions']:
                durations = data['sessions']['duration_minutes']
                q1, q3 = durations.quantile([0.25, 0.75])
                iqr = q3 - q1
                outliers = ((durations < (q1 - 1.5 * iqr)) | (durations > (q3 + 1.5 * iqr))).sum()
                outlier_rate = outliers / len(durations)

                if outlier_rate > 0:
                    anomalies['rate'] = outlier_rate
                    anomalies['description'] = f"{outliers} duration outliers detected"
                    anomalies['details'].append({
                        'type': 'duration_outliers',
                        'count': outliers,
                        'rate': outlier_rate
                    })

        # Check for impossible values
        if 'consciousness' in data and not data['consciousness'].empty:
            if 'coherence' in data['consciousness']:
                impossible = ((data['consciousness']['coherence'] < 0) |
                             (data['consciousness']['coherence'] > 1)).sum()
                if impossible > 0:
                    anomalies['rate'] = max(anomalies['rate'], impossible / len(data['consciousness']))
                    anomalies['description'] += f", {impossible} impossible coherence values"

        return anomalies

    def _check_temporal_consistency(self, data: Dict[str, pd.DataFrame], week_num: int) -> List[str]:
        """Check for temporal inconsistencies"""
        issues = []

        # Check if data is from the correct week
        if 'sessions' in data and not data['sessions'].empty:
            if 'created_at' in data['sessions']:
                df = data['sessions'].copy()
                df['created_at'] = pd.to_datetime(df['created_at'])
                df['week'] = df['created_at'].dt.isocalendar().week

                wrong_week = df[df['week'] != week_num]
                if len(wrong_week) > 0:
                    issues.append(f"{len(wrong_week)} sessions from incorrect week")

                # Check for future dates
                future_sessions = df[df['created_at'] > datetime.now()]
                if len(future_sessions) > 0:
                    issues.append(f"{len(future_sessions)} sessions have future timestamps")

        return issues

    def _validate_breakthrough_detection(self, data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """Validate breakthrough detection isn't over/under sensitive"""
        result = {
            'suspicious': False,
            'reason': '',
            'rate': 0.0
        }

        if 'breakthroughs' in data and 'sessions' in data:
            if not data['breakthroughs'].empty and not data['sessions'].empty:
                breakthrough_rate = len(data['breakthroughs']) / len(data['sessions'])
                result['rate'] = breakthrough_rate

                # Check if rate is suspiciously high
                if breakthrough_rate > 0.15:  # More than 15% is suspicious
                    result['suspicious'] = True
                    result['reason'] = f"Rate too high ({breakthrough_rate:.1%})"
                elif breakthrough_rate < 0.001:  # Less than 0.1% might indicate detection failure
                    result['suspicious'] = True
                    result['reason'] = f"Rate too low ({breakthrough_rate:.1%})"

        return result

    def _generate_recommendations(self, validation_results: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations based on validation results"""
        recommendations = []

        # Low conversation volume
        if validation_results['stats'].get('conversation_count', 0) < 50:
            recommendations.append(
                "Consider extending beta period or recruiting more participants "
                "to achieve statistical power"
            )

        # Firewall imbalance
        if 'firewall_balance' in validation_results['stats']:
            imbalance = validation_results['stats']['firewall_balance']['imbalance']
            if imbalance > 0.1:
                recommendations.append(
                    "Review firewall assignment logic to ensure proper randomization"
                )

        # High anomaly rate
        if validation_results['stats'].get('anomaly_rate', 0) > 0.05:
            recommendations.append(
                "Investigate anomalies before proceeding with analysis"
            )

        # Data quality issues
        if validation_results.get('quality_score', 100) < 70:
            recommendations.append(
                "Address data quality issues before drawing conclusions"
            )

        return recommendations

    def _calculate_quality_score(self, validation_results: Dict[str, Any]) -> int:
        """Calculate overall data quality score (0-100)"""
        score = 100

        # Deduct for errors (20 points each)
        score -= len(validation_results['errors']) * 20

        # Deduct for warnings (10 points each)
        score -= len(validation_results['warnings']) * 10

        # Deduct for low completeness
        completeness = validation_results['stats'].get('completeness', 1.0)
        if completeness < 1.0:
            score -= (1.0 - completeness) * 30

        # Deduct for low volume
        conversations = validation_results['stats'].get('conversation_count', 0)
        if conversations < 50:
            score -= (50 - conversations) * 0.5

        # Ensure score stays in valid range
        return max(0, min(100, score))

    def generate_validation_report(self, validation_results: Dict[str, Any], week_num: int) -> str:
        """Generate markdown validation report"""
        report = []
        report.append(f"# Data Validation Report - Week {week_num}")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")

        # Quality Score
        score = validation_results.get('quality_score', 0)
        score_emoji = "✅" if score >= 80 else "⚠️" if score >= 60 else "❌"
        report.append(f"## {score_emoji} Data Quality Score: {score}/100\n")

        # Statistics
        report.append("## Key Statistics")
        stats = validation_results.get('stats', {})
        report.append(f"- Conversations: {stats.get('conversation_count', 0)}")
        report.append(f"- Unique Users: {stats.get('unique_users', 0)}")
        report.append(f"- Data Completeness: {stats.get('completeness', 0):.1%}")
        report.append(f"- Duplicate Rate: {stats.get('duplicate_rate', 0):.1%}")
        report.append(f"- Anomaly Rate: {stats.get('anomaly_rate', 0):.1%}\n")

        # Errors
        if validation_results.get('errors'):
            report.append("## ❌ Errors (Must Fix)")
            for error in validation_results['errors']:
                report.append(f"- {error}")
            report.append("")

        # Warnings
        if validation_results.get('warnings'):
            report.append("## ⚠️ Warnings")
            for warning in validation_results['warnings']:
                report.append(f"- {warning}")
            report.append("")

        # Recommendations
        if validation_results.get('recommendations'):
            report.append("## 💡 Recommendations")
            for rec in validation_results['recommendations']:
                report.append(f"- {rec}")
            report.append("")

        # Validation Status
        status = "✅ PASSED" if validation_results['valid'] else "❌ FAILED"
        report.append(f"## Validation Status: {status}")

        return '\n'.join(report)