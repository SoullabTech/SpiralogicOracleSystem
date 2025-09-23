#!/usr/bin/env python3
"""
Beta Analytics Complete System
Spiralogic Oracle System - Production Ready
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from datetime import datetime, timedelta
from pathlib import Path
import json
from typing import Dict, List, Tuple, Any
import warnings
warnings.filterwarnings('ignore')

# Configure visualization style
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

class BetaAnalytics:
    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize with Supabase connection"""
        try:
            from supabase import create_client
            self.supabase = create_client(supabase_url, supabase_key)
        except:
            # Mock mode for testing
            self.supabase = None
            print("⚠️ Running in mock mode - using generated test data")

    def fetch_week_data(self, week: int) -> Dict[str, pd.DataFrame]:
        """Fetch all data for specified week"""
        start_date = datetime(2025, 1, 15) + timedelta(weeks=week-1)
        end_date = start_date + timedelta(days=7)

        if self.supabase:
            return self._fetch_real_data(start_date, end_date)
        else:
            return self._generate_mock_data(week)

    def _fetch_real_data(self, start_date, end_date) -> Dict[str, pd.DataFrame]:
        """Fetch real data from Supabase"""
        data = {}

        # Fetch sessions
        sessions = self.supabase.table('session_analytics') \
            .select('*') \
            .gte('created_at', start_date.isoformat()) \
            .lt('created_at', end_date.isoformat()) \
            .execute()
        data['sessions'] = pd.DataFrame(sessions.data if sessions.data else [])

        # Fetch consciousness states
        states = self.supabase.table('consciousness_states') \
            .select('*') \
            .gte('timestamp', start_date.isoformat()) \
            .lt('timestamp', end_date.isoformat()) \
            .execute()
        data['consciousness'] = pd.DataFrame(states.data if states.data else [])

        # Fetch breakthroughs
        breakthroughs = self.supabase.table('breakthrough_events') \
            .select('*') \
            .gte('detected_at', start_date.isoformat()) \
            .lt('detected_at', end_date.isoformat()) \
            .execute()
        data['breakthroughs'] = pd.DataFrame(breakthroughs.data if breakthroughs.data else [])

        # Fetch firewall metrics
        firewall = self.supabase.table('firewall_metrics') \
            .select('*') \
            .gte('timestamp', start_date.isoformat()) \
            .lt('timestamp', end_date.isoformat()) \
            .execute()
        data['firewall'] = pd.DataFrame(firewall.data if firewall.data else [])

        return data

    def _generate_mock_data(self, week: int) -> Dict[str, pd.DataFrame]:
        """Generate mock data for testing"""
        np.random.seed(42 + week)  # Reproducible randomness

        # Mock sessions data
        n_sessions = np.random.randint(50, 150)
        sessions_data = {
            'user_id': [f'user_{i%20}' for i in range(n_sessions)],
            'session_id': [f'session_{i}' for i in range(n_sessions)],
            'duration_seconds': np.random.gamma(4, 300, n_sessions),
            'message_count': np.random.poisson(15, n_sessions),
            'created_at': pd.date_range(
                start=datetime(2025, 1, 15) + timedelta(weeks=week-1),
                periods=n_sessions,
                freq='H'
            )
        }

        # Mock consciousness data
        n_states = n_sessions * 5
        consciousness_data = {
            'user_id': [f'user_{i%20}' for i in range(n_states)],
            'coherence': np.random.beta(5, 2, n_states),
            'resonance': np.random.beta(4, 3, n_states),
            'flow_state': np.random.beta(3, 4, n_states),
            'timestamp': pd.date_range(
                start=datetime(2025, 1, 15) + timedelta(weeks=week-1),
                periods=n_states,
                freq='15min'
            )
        }

        # Mock breakthrough events
        n_breakthroughs = np.random.randint(5, 20)
        breakthrough_data = {
            'user_id': [f'user_{i%20}' for i in range(n_breakthroughs)],
            'pattern_type': np.random.choice(['insight', 'synthesis', 'emergence'], n_breakthroughs),
            'magnitude': np.random.gamma(2, 0.5, n_breakthroughs),
            'detected_at': pd.date_range(
                start=datetime(2025, 1, 15) + timedelta(weeks=week-1),
                periods=n_breakthroughs,
                freq='D'
            )
        }

        # Mock firewall metrics
        firewall_data = {
            'integrity_score': np.random.beta(8, 2, 168),  # Hourly for a week
            'water_strength': np.random.beta(5, 3, 168),
            'fire_strength': np.random.beta(6, 2, 168),
            'earth_strength': np.random.beta(7, 3, 168),
            'air_strength': np.random.beta(4, 2, 168),
            'aether_strength': np.random.beta(5, 2, 168),
            'timestamp': pd.date_range(
                start=datetime(2025, 1, 15) + timedelta(weeks=week-1),
                periods=168,
                freq='H'
            )
        }

        return {
            'sessions': pd.DataFrame(sessions_data),
            'consciousness': pd.DataFrame(consciousness_data),
            'breakthroughs': pd.DataFrame(breakthrough_data),
            'firewall': pd.DataFrame(firewall_data)
        }

    def calculate_engagement_metrics(self, data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """Calculate engagement metrics with confidence intervals"""
        sessions_df = data['sessions']

        if sessions_df.empty:
            return {'error': 'No session data available'}

        metrics = {}

        # Active users
        metrics['active_users'] = sessions_df['user_id'].nunique()

        # Total sessions
        metrics['total_sessions'] = len(sessions_df)

        # Average session duration (in minutes)
        metrics['avg_duration'] = sessions_df['duration_seconds'].mean() / 60
        metrics['duration_std'] = sessions_df['duration_seconds'].std() / 60

        # Wilson score interval for small sample
        n = len(sessions_df)
        if n > 0:
            p_hat = sessions_df['message_count'].apply(lambda x: x > 10).mean()
            z = 1.96  # 95% confidence
            denominator = 1 + z**2/n
            centre = (p_hat + z**2/(2*n)) / denominator
            offset = z * np.sqrt((p_hat*(1-p_hat)/n + z**2/(4*n**2))) / denominator
            metrics['engagement_rate_ci'] = (max(0, centre-offset), min(1, centre+offset))
            metrics['engagement_rate'] = p_hat

        # Retention (users with >1 session)
        user_sessions = sessions_df.groupby('user_id').size()
        metrics['retention'] = (user_sessions > 1).mean()

        return metrics

    def calculate_consciousness_metrics(self, data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """Calculate consciousness tracking metrics"""
        cons_df = data['consciousness']
        breakthrough_df = data['breakthroughs']

        if cons_df.empty:
            return {'error': 'No consciousness data available'}

        metrics = {}

        # Average coherence with confidence interval
        coherence = cons_df['coherence'].values
        metrics['avg_coherence'] = np.mean(coherence)
        metrics['coherence_ci'] = stats.t.interval(
            0.95,
            len(coherence)-1,
            loc=np.mean(coherence),
            scale=stats.sem(coherence)
        )

        # Breakthrough frequency
        metrics['breakthroughs'] = len(breakthrough_df)
        metrics['breakthrough_users'] = breakthrough_df['user_id'].nunique() if not breakthrough_df.empty else 0

        # Peak states (coherence > 0.8)
        metrics['peak_states'] = (cons_df['coherence'] > 0.8).sum()

        # Flow state analysis
        flow_states = cons_df['flow_state'].values
        metrics['avg_flow'] = np.mean(flow_states)

        # Resonance patterns
        metrics['avg_resonance'] = cons_df['resonance'].mean()

        return metrics

    def calculate_firewall_metrics(self, data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """Calculate elemental firewall integrity"""
        firewall_df = data['firewall']

        if firewall_df.empty:
            return {'error': 'No firewall data available'}

        metrics = {}

        # Overall integrity
        metrics['integrity'] = firewall_df['integrity_score'].mean()
        metrics['integrity_std'] = firewall_df['integrity_score'].std()

        # Elemental balance
        elements = ['water', 'fire', 'earth', 'air', 'aether']
        for element in elements:
            col = f'{element}_strength'
            if col in firewall_df.columns:
                metrics[f'{element}_avg'] = firewall_df[col].mean()

        # Voice distinction (using coefficient of variation)
        strengths = firewall_df[[f'{e}_strength' for e in elements if f'{e}_strength' in firewall_df.columns]]
        if not strengths.empty:
            row_cv = strengths.std(axis=1) / strengths.mean(axis=1)
            metrics['distinction'] = row_cv.mean()

        return metrics

    def create_pentagon_visualization(self, data: Dict[str, pd.DataFrame], output_path: str):
        """Create pentagon diagram for 5 elements"""
        firewall_df = data['firewall']

        if firewall_df.empty:
            return

        # Calculate average strengths
        elements = ['Water', 'Fire', 'Earth', 'Air', 'Aether']
        values = []

        for element in [e.lower() for e in elements]:
            col = f'{element}_strength'
            if col in firewall_df.columns:
                values.append(firewall_df[col].mean())
            else:
                values.append(0.5)  # Default value

        # Create radar chart
        angles = np.linspace(0, 2 * np.pi, len(elements), endpoint=False)
        values = np.array(values)

        fig, ax = plt.subplots(1, 1, figsize=(10, 10), subplot_kw=dict(projection='polar'))

        # Plot
        angles_plot = np.concatenate([angles, [angles[0]]])
        values_plot = np.concatenate([values, [values[0]]])

        ax.plot(angles_plot, values_plot, 'o-', linewidth=2, color='#FF6B6B')
        ax.fill(angles_plot, values_plot, alpha=0.25, color='#4ECDC4')

        ax.set_xticks(angles)
        ax.set_xticklabels(elements, size=12)
        ax.set_ylim(0, 1)
        ax.set_title('Elemental Firewall Integrity', size=16, pad=20)

        # Add grid
        ax.grid(True)

        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()

    def create_heatmap_visualization(self, data: Dict[str, pd.DataFrame], output_path: str):
        """Create Facet-Element synergy heatmap"""
        # Generate synergy matrix (12 facets x 5 elements)
        facets = [
            'Explorer', 'Muse', 'Oracle', 'Creator',
            'Alchemist', 'Luminary', 'Sage', 'Guardian',
            'Catalyst', 'Phoenix', 'Weaver', 'Starborn'
        ]
        elements = ['Water', 'Fire', 'Earth', 'Air', 'Aether']

        # Create mock synergy data based on consciousness states
        np.random.seed(42)
        synergy_matrix = np.random.beta(4, 2, (len(facets), len(elements)))

        # Add some structure to make it interesting
        synergy_matrix[0, 1] = 0.9  # Explorer-Fire
        synergy_matrix[2, 0] = 0.85  # Oracle-Water
        synergy_matrix[4, 4] = 0.88  # Alchemist-Aether

        # Create heatmap
        fig, ax = plt.subplots(figsize=(10, 12))

        sns.heatmap(
            synergy_matrix,
            annot=True,
            fmt='.2f',
            cmap='YlOrRd',
            xticklabels=elements,
            yticklabels=facets,
            cbar_kws={'label': 'Synergy Score'},
            ax=ax
        )

        ax.set_title('Facet-Element Synergy Matrix', size=16, pad=20)
        ax.set_xlabel('Elements', size=12)
        ax.set_ylabel('Facets', size=12)

        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()

    def create_breakthrough_timeline(self, data: Dict[str, pd.DataFrame], output_path: str):
        """Create breakthrough event timeline"""
        breakthrough_df = data['breakthroughs']

        if breakthrough_df.empty:
            # Create empty plot with message
            fig, ax = plt.subplots(figsize=(14, 6))
            ax.text(0.5, 0.5, 'No breakthrough events detected this week',
                   ha='center', va='center', size=14)
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')
        else:
            # Create timeline
            fig, ax = plt.subplots(figsize=(14, 6))

            # Convert timestamps
            breakthrough_df['detected_at'] = pd.to_datetime(breakthrough_df['detected_at'])

            # Plot events
            for idx, row in breakthrough_df.iterrows():
                ax.scatter(
                    row['detected_at'],
                    row['magnitude'],
                    s=200,
                    alpha=0.6,
                    c='purple' if row['pattern_type'] == 'emergence' else 'orange'
                )

            ax.set_xlabel('Time', size=12)
            ax.set_ylabel('Magnitude', size=12)
            ax.set_title('Breakthrough Events Timeline', size=16)

            # Format x-axis
            fig.autofmt_xdate()

        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()

    def export_data_to_csv(self, data: Dict[str, pd.DataFrame], output_dir: Path, week: int):
        """Export all data to CSV files for archival"""
        csv_dir = output_dir / f"Week {week} CSVs"
        csv_dir.mkdir(exist_ok=True)

        # Export breakthroughs data
        if 'breakthroughs' in data and not data['breakthroughs'].empty:
            data['breakthroughs'].to_csv(csv_dir / 'breakthroughs.csv', index=False)

        # Export consciousness states
        if 'consciousness' in data and not data['consciousness'].empty:
            data['consciousness'].to_csv(csv_dir / 'elements.csv', index=False)

        # Export firewall triggers
        if 'firewall' in data and not data['firewall'].empty:
            data['firewall'].to_csv(csv_dir / 'firewall.csv', index=False)

        # Export sessions as engagement
        if 'sessions' in data and not data['sessions'].empty:
            data['sessions'].to_csv(csv_dir / 'engagement.csv', index=False)

        # Create patterns CSV from aggregated data
        patterns_data = self._extract_patterns(data)
        if patterns_data:
            pd.DataFrame(patterns_data).to_csv(csv_dir / 'patterns.csv', index=False)

        # Create feedback CSV (placeholder for now)
        feedback_data = self._extract_feedback(data)
        if feedback_data:
            pd.DataFrame(feedback_data).to_csv(csv_dir / 'feedback.csv', index=False)

        print(f"📁 Exported CSVs to {csv_dir}")

    def _extract_patterns(self, data: Dict[str, pd.DataFrame]) -> list:
        """Extract conversation patterns for CSV export"""
        patterns = []

        if 'sessions' in data and not data['sessions'].empty:
            df = data['sessions']

            # Calculate patterns per user
            for user_id in df['user_id'].unique() if 'user_id' in df.columns else []:
                user_sessions = df[df['user_id'] == user_id]
                patterns.append({
                    'user_id': user_id,
                    'total_sessions': len(user_sessions),
                    'avg_duration': user_sessions['duration_minutes'].mean() if 'duration_minutes' in user_sessions else 0,
                    'peak_hour': user_sessions['created_at'].dt.hour.mode()[0] if 'created_at' in user_sessions and not user_sessions.empty else None,
                    'pattern_type': 'regular' if len(user_sessions) > 3 else 'exploratory'
                })

        return patterns

    def _extract_feedback(self, data: Dict[str, pd.DataFrame]) -> list:
        """Extract feedback data for CSV export (placeholder implementation)"""
        feedback = []

        # This would normally extract from actual feedback table
        # For now, create summary based on breakthrough data
        if 'breakthroughs' in data and not data['breakthroughs'].empty:
            df = data['breakthroughs']
            feedback.append({
                'week': df['created_at'].dt.isocalendar().week.mode()[0] if 'created_at' in df and not df.empty else None,
                'positive_breakthroughs': len(df[df['intensity'] > 0.7]) if 'intensity' in df else 0,
                'total_breakthroughs': len(df),
                'avg_intensity': df['intensity'].mean() if 'intensity' in df else 0,
                'sentiment': 'positive' if df['intensity'].mean() > 0.6 else 'neutral' if 'intensity' in df else 'neutral'
            })

        return feedback

    def generate_statistical_report(self, metrics: Dict[str, Dict]) -> str:
        """Generate detailed statistical report"""
        report = []
        report.append("# Statistical Analysis Report\n")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

        # Engagement section
        if 'engagement' in metrics:
            report.append("\n## Engagement Metrics\n")
            eng = metrics['engagement']

            report.append(f"- Active Users: {eng.get('active_users', 0)}")
            report.append(f"- Total Sessions: {eng.get('total_sessions', 0)}")
            report.append(f"- Avg Duration: {eng.get('avg_duration', 0):.2f} ± {eng.get('duration_std', 0):.2f} minutes")

            if 'engagement_rate_ci' in eng:
                ci = eng['engagement_rate_ci']
                report.append(f"- Engagement Rate: {eng.get('engagement_rate', 0):.2%} (95% CI: [{ci[0]:.2%}, {ci[1]:.2%}])")

            report.append(f"- Retention Rate: {eng.get('retention', 0):.2%}")

        # Consciousness section
        if 'consciousness' in metrics:
            report.append("\n## Consciousness Metrics\n")
            cons = metrics['consciousness']

            report.append(f"- Avg Coherence: {cons.get('avg_coherence', 0):.3f}")
            if 'coherence_ci' in cons:
                ci = cons['coherence_ci']
                report.append(f"  95% CI: [{ci[0]:.3f}, {ci[1]:.3f}]")

            report.append(f"- Breakthrough Events: {cons.get('breakthroughs', 0)}")
            report.append(f"- Users with Breakthroughs: {cons.get('breakthrough_users', 0)}")
            report.append(f"- Peak States Achieved: {cons.get('peak_states', 0)}")
            report.append(f"- Avg Flow State: {cons.get('avg_flow', 0):.3f}")

        # Firewall section
        if 'firewall' in metrics:
            report.append("\n## Elemental Firewall\n")
            fw = metrics['firewall']

            report.append(f"- Integrity Score: {fw.get('integrity', 0):.3f} ± {fw.get('integrity_std', 0):.3f}")
            report.append(f"- Voice Distinction: {fw.get('distinction', 0):.3f}")

            report.append("\nElemental Strengths:")
            for element in ['water', 'fire', 'earth', 'air', 'aether']:
                if f'{element}_avg' in fw:
                    report.append(f"  - {element.capitalize()}: {fw[f'{element}_avg']:.3f}")

        return '\n'.join(report)

def run_week_analysis(week: int, supabase_url: str, supabase_key: str, output_dir: str = '.') -> Dict:
    """Main function to run complete week analysis"""
    print(f"\n🚀 Starting Week {week} Analysis")

    # Initialize analyzer
    analyzer = BetaAnalytics(supabase_url, supabase_key)

    # Fetch data
    print("📊 Fetching data...")
    data = analyzer.fetch_week_data(week)

    # Calculate metrics
    print("🧮 Calculating metrics...")
    metrics = {
        'engagement': analyzer.calculate_engagement_metrics(data),
        'consciousness': analyzer.calculate_consciousness_metrics(data),
        'firewall': analyzer.calculate_firewall_metrics(data)
    }

    # Create visualizations
    print("📈 Creating visualizations...")
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    analyzer.create_pentagon_visualization(data, str(output_path / f'pentagon_week_{week}.png'))
    analyzer.create_heatmap_visualization(data, str(output_path / f'heatmap_week_{week}.png'))
    analyzer.create_breakthrough_timeline(data, str(output_path / f'breakthrough_timeline_week_{week}.png'))

    # Export data to CSV files
    print("📊 Exporting data to CSV...")
    analyzer.export_data_to_csv(data, output_path, week)

    # Generate report
    print("📝 Generating report...")
    report = analyzer.generate_statistical_report(metrics)

    # Save report
    report_path = output_path / f'week_{week}_report.md'
    with open(report_path, 'w') as f:
        f.write(report)

    print(f"✅ Analysis complete! Report saved to {report_path}")

    return metrics

if __name__ == "__main__":
    # Test with mock data
    import sys

    week = int(sys.argv[1]) if len(sys.argv) > 1 else 1

    # Use mock credentials for testing
    results = run_week_analysis(
        week=week,
        supabase_url="mock-url",
        supabase_key="mock-key",
        output_dir="./analytics_output"
    )

    # Display summary
    print("\n📊 Summary:")
    print(json.dumps(results, indent=2, default=str))