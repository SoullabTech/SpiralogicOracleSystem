"""
Hypothesis Pre-Registration System for Beta Research
Ensures scientific rigor by pre-defining expected outcomes and tests
"""

import json
import hashlib
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
import numpy as np
from scipy import stats
from statsmodels.stats.power import TTestPower


class HypothesisRegistry:
    """Manages pre-registered hypotheses and validates results against them"""

    def __init__(self, registry_path: str = None):
        self.registry_path = Path(registry_path) if registry_path else Path.home() / '.maya' / 'hypotheses.json'
        self.hypotheses = self._load_registry()
        self.results = {}

    def _load_registry(self) -> Dict[str, Any]:
        """Load existing hypothesis registry or create default"""
        if self.registry_path.exists():
            with open(self.registry_path, 'r') as f:
                return json.load(f)

        # Default hypotheses for Maya beta
        default_hypotheses = {
            'metadata': {
                'registered_at': datetime.now().isoformat(),
                'version': '1.0',
                'locked': False
            },
            'hypotheses': {
                'H1': {
                    'description': 'Strict firewall will increase conversation depth by 15%',
                    'metric': 'avg_conversation_depth',
                    'comparison': 'firewall_strict_vs_loose',
                    'expected_effect_size': 0.15,
                    'direction': 'greater',
                    'statistical_test': 'independent_t_test',
                    'alpha': 0.05,
                    'power_target': 0.80,
                    'primary': True
                },
                'H2': {
                    'description': 'Natural breakthrough rate will be 2-3% without optimization',
                    'metric': 'breakthrough_rate',
                    'comparison': 'absolute',
                    'expected_range': [0.02, 0.03],
                    'statistical_test': 'confidence_interval',
                    'alpha': 0.05,
                    'primary': True
                },
                'H3': {
                    'description': 'Water and Fire elements will dominate natural usage (>60% combined)',
                    'metric': 'element_distribution',
                    'comparison': 'proportion',
                    'expected_threshold': 0.60,
                    'elements': ['water', 'fire'],
                    'statistical_test': 'binomial_test',
                    'alpha': 0.05,
                    'primary': False
                },
                'H4': {
                    'description': 'User satisfaction will maintain >60% "Helpful" ratings',
                    'metric': 'satisfaction_helpful_rate',
                    'comparison': 'threshold',
                    'expected_threshold': 0.60,
                    'direction': 'greater',
                    'statistical_test': 'binomial_test',
                    'alpha': 0.05,
                    'primary': False
                },
                'H5': {
                    'description': 'Breakthrough moments correlate with depth (r > 0.3)',
                    'metric': 'breakthrough_depth_correlation',
                    'comparison': 'correlation',
                    'expected_correlation': 0.3,
                    'direction': 'greater',
                    'statistical_test': 'pearson_correlation',
                    'alpha': 0.05,
                    'primary': False
                }
            },
            'power_calculations': {},
            'results': {}
        }

        # Save default registry
        self.registry_path.parent.mkdir(exist_ok=True)
        with open(self.registry_path, 'w') as f:
            json.dump(default_hypotheses, f, indent=2)

        return default_hypotheses

    def lock_registry(self):
        """Lock hypotheses to prevent modification after data collection starts"""
        if not self.hypotheses['metadata']['locked']:
            self.hypotheses['metadata']['locked'] = True
            self.hypotheses['metadata']['locked_at'] = datetime.now().isoformat()

            # Generate integrity hash
            hypothesis_str = json.dumps(self.hypotheses['hypotheses'], sort_keys=True)
            self.hypotheses['metadata']['integrity_hash'] = hashlib.sha256(
                hypothesis_str.encode()
            ).hexdigest()[:16]

            self._save_registry()
            print("✅ Hypothesis registry locked. No modifications allowed.")
        else:
            print("⚠️ Registry already locked since", self.hypotheses['metadata'].get('locked_at'))

    def _save_registry(self):
        """Save registry to disk"""
        with open(self.registry_path, 'w') as f:
            json.dump(self.hypotheses, f, indent=2)

    def calculate_required_sample_sizes(self) -> Dict[str, int]:
        """Calculate required sample sizes for each hypothesis"""
        power_calc = TTestPower()
        sample_sizes = {}

        for h_id, hypothesis in self.hypotheses['hypotheses'].items():
            if hypothesis.get('statistical_test') == 'independent_t_test':
                # Calculate effect size from expected change
                effect_size = hypothesis.get('expected_effect_size', 0.15)

                # Cohen's d approximation
                cohens_d = effect_size / 0.5  # Assuming moderate variance

                sample_size = power_calc.solve_power(
                    effect_size=cohens_d,
                    power=hypothesis.get('power_target', 0.80),
                    alpha=hypothesis.get('alpha', 0.05),
                    alternative='two-sided'
                )

                sample_sizes[h_id] = {
                    'per_group': int(np.ceil(sample_size)),
                    'total': int(np.ceil(sample_size * 2)),
                    'description': hypothesis['description']
                }

            elif hypothesis.get('statistical_test') == 'binomial_test':
                # For proportion tests
                from statsmodels.stats.proportion import samplesize_proportions_2indep

                p1 = hypothesis.get('expected_threshold', 0.60)
                # Assume we want to detect 10% difference
                p2 = p1 - 0.10

                sample_size = samplesize_proportions_2indep(
                    p1, p2,
                    alpha=hypothesis.get('alpha', 0.05),
                    power=hypothesis.get('power_target', 0.80)
                )

                sample_sizes[h_id] = {
                    'total': int(np.ceil(sample_size)),
                    'description': hypothesis['description']
                }

        self.hypotheses['power_calculations'] = sample_sizes
        self._save_registry()
        return sample_sizes

    def test_hypothesis(self, h_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Test a specific hypothesis against collected data"""
        if h_id not in self.hypotheses['hypotheses']:
            raise ValueError(f"Hypothesis {h_id} not found in registry")

        hypothesis = self.hypotheses['hypotheses'][h_id]
        result = {
            'hypothesis_id': h_id,
            'description': hypothesis['description'],
            'tested_at': datetime.now().isoformat(),
            'data_points': len(data.get('values', [])),
            'result': None,
            'p_value': None,
            'effect_size': None,
            'confidence_interval': None,
            'conclusion': None,
            'supported': False
        }

        test_type = hypothesis['statistical_test']

        if test_type == 'independent_t_test':
            result.update(self._run_t_test(hypothesis, data))
        elif test_type == 'confidence_interval':
            result.update(self._run_ci_test(hypothesis, data))
        elif test_type == 'binomial_test':
            result.update(self._run_binomial_test(hypothesis, data))
        elif test_type == 'pearson_correlation':
            result.update(self._run_correlation_test(hypothesis, data))
        else:
            result['error'] = f"Unknown test type: {test_type}"

        # Store result
        self.results[h_id] = result
        return result

    def _run_t_test(self, hypothesis: Dict, data: Dict) -> Dict[str, Any]:
        """Run independent samples t-test"""
        group1 = data.get('group1', [])
        group2 = data.get('group2', [])

        if len(group1) < 2 or len(group2) < 2:
            return {
                'error': 'Insufficient data for t-test',
                'supported': False
            }

        # Run t-test
        t_stat, p_value = stats.ttest_ind(group1, group2)

        # Calculate effect size (Cohen's d)
        pooled_std = np.sqrt((np.std(group1)**2 + np.std(group2)**2) / 2)
        cohens_d = (np.mean(group1) - np.mean(group2)) / pooled_std if pooled_std > 0 else 0

        # Calculate confidence interval for difference
        diff = np.mean(group1) - np.mean(group2)
        se_diff = pooled_std * np.sqrt(1/len(group1) + 1/len(group2))
        ci_lower = diff - 1.96 * se_diff
        ci_upper = diff + 1.96 * se_diff

        # Determine if hypothesis is supported
        expected_effect = hypothesis.get('expected_effect_size', 0)
        direction = hypothesis.get('direction', 'two-sided')

        if direction == 'greater':
            supported = p_value < hypothesis['alpha'] and diff > 0
        elif direction == 'less':
            supported = p_value < hypothesis['alpha'] and diff < 0
        else:
            supported = p_value < hypothesis['alpha']

        return {
            'test_statistic': float(t_stat),
            'p_value': float(p_value),
            'effect_size': float(cohens_d),
            'mean_difference': float(diff),
            'confidence_interval': [float(ci_lower), float(ci_upper)],
            'group1_mean': float(np.mean(group1)),
            'group2_mean': float(np.mean(group2)),
            'supported': supported,
            'conclusion': f"{'Supported' if supported else 'Not supported'} (p={p_value:.3f})"
        }

    def _run_ci_test(self, hypothesis: Dict, data: Dict) -> Dict[str, Any]:
        """Test if value falls within expected confidence interval"""
        values = data.get('values', [])

        if len(values) < 2:
            return {
                'error': 'Insufficient data for confidence interval',
                'supported': False
            }

        mean = np.mean(values)
        std_err = stats.sem(values)
        ci = stats.t.interval(
            1 - hypothesis['alpha'],
            len(values) - 1,
            mean,
            std_err
        )

        expected_range = hypothesis.get('expected_range', [0, 1])
        in_range = expected_range[0] <= mean <= expected_range[1]

        return {
            'observed_value': float(mean),
            'confidence_interval': [float(ci[0]), float(ci[1])],
            'expected_range': expected_range,
            'standard_error': float(std_err),
            'supported': in_range,
            'conclusion': f"Value {mean:.3f} {'within' if in_range else 'outside'} expected range"
        }

    def _run_binomial_test(self, hypothesis: Dict, data: Dict) -> Dict[str, Any]:
        """Test proportion against expected threshold"""
        successes = data.get('successes', 0)
        trials = data.get('trials', 0)

        if trials == 0:
            return {
                'error': 'No trials for binomial test',
                'supported': False
            }

        observed_prop = successes / trials
        expected_prop = hypothesis.get('expected_threshold', 0.5)

        # Run binomial test
        p_value = stats.binomtest(
            successes,
            trials,
            expected_prop,
            alternative='greater' if hypothesis.get('direction') == 'greater' else 'two-sided'
        ).pvalue

        # Wilson confidence interval
        from statsmodels.stats.proportion import proportion_confint
        ci_lower, ci_upper = proportion_confint(successes, trials, method='wilson')

        supported = p_value < hypothesis['alpha']
        if hypothesis.get('direction') == 'greater':
            supported = supported and observed_prop > expected_prop

        return {
            'observed_proportion': float(observed_prop),
            'expected_proportion': float(expected_prop),
            'successes': int(successes),
            'trials': int(trials),
            'p_value': float(p_value),
            'confidence_interval': [float(ci_lower), float(ci_upper)],
            'supported': supported,
            'conclusion': f"Proportion {observed_prop:.1%} {'>' if supported else 'not >'} {expected_prop:.1%}"
        }

    def _run_correlation_test(self, hypothesis: Dict, data: Dict) -> Dict[str, Any]:
        """Test correlation between two variables"""
        x = data.get('x', [])
        y = data.get('y', [])

        if len(x) < 3 or len(y) < 3 or len(x) != len(y):
            return {
                'error': 'Insufficient paired data for correlation',
                'supported': False
            }

        # Calculate correlation
        r, p_value = stats.pearsonr(x, y)

        # Confidence interval for correlation
        z = np.arctanh(r)
        se = 1 / np.sqrt(len(x) - 3)
        z_ci = [z - 1.96 * se, z + 1.96 * se]
        r_ci = [np.tanh(z_val) for z_val in z_ci]

        expected_r = hypothesis.get('expected_correlation', 0)
        direction = hypothesis.get('direction', 'two-sided')

        if direction == 'greater':
            supported = p_value < hypothesis['alpha'] and r > expected_r
        else:
            supported = p_value < hypothesis['alpha']

        return {
            'correlation': float(r),
            'p_value': float(p_value),
            'confidence_interval': [float(r_ci[0]), float(r_ci[1])],
            'n_pairs': len(x),
            'expected_correlation': float(expected_r),
            'supported': supported,
            'conclusion': f"r={r:.3f} {'>' if supported else 'not >'} {expected_r}"
        }

    def generate_hypothesis_report(self) -> str:
        """Generate comprehensive hypothesis testing report"""
        report = []
        report.append("# Hypothesis Testing Report")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")

        # Registry status
        if self.hypotheses['metadata'].get('locked'):
            report.append(f"✅ Registry locked: {self.hypotheses['metadata'].get('locked_at')}")
            report.append(f"Integrity: {self.hypotheses['metadata'].get('integrity_hash')}\n")
        else:
            report.append("⚠️ Registry not locked - results are preliminary\n")

        # Power calculations
        if self.hypotheses.get('power_calculations'):
            report.append("## Required Sample Sizes")
            for h_id, calc in self.hypotheses['power_calculations'].items():
                report.append(f"- **{h_id}**: {calc.get('total', 'N/A')} total")
            report.append("")

        # Test results
        report.append("## Hypothesis Test Results\n")

        primary_supported = 0
        primary_total = 0

        for h_id, hypothesis in self.hypotheses['hypotheses'].items():
            is_primary = hypothesis.get('primary', False)

            if is_primary:
                primary_total += 1

            if h_id in self.results:
                result = self.results[h_id]
                status = "✅" if result['supported'] else "❌"

                if is_primary and result['supported']:
                    primary_supported += 1

                report.append(f"### {status} {h_id}: {hypothesis['description']}")
                report.append(f"**Primary:** {'Yes' if is_primary else 'No'}")

                if result.get('p_value') is not None:
                    report.append(f"**p-value:** {result['p_value']:.4f}")

                if result.get('effect_size') is not None:
                    report.append(f"**Effect size:** {result['effect_size']:.3f}")

                if result.get('confidence_interval'):
                    ci = result['confidence_interval']
                    report.append(f"**95% CI:** [{ci[0]:.3f}, {ci[1]:.3f}]")

                report.append(f"**Conclusion:** {result.get('conclusion', 'No conclusion')}\n")
            else:
                report.append(f"### ⏳ {h_id}: {hypothesis['description']}")
                report.append("*Not yet tested*\n")

        # Summary
        report.append("## Summary")
        if primary_total > 0:
            success_rate = primary_supported / primary_total
            report.append(f"Primary hypotheses supported: {primary_supported}/{primary_total} ({success_rate:.0%})")

        total_tested = len(self.results)
        total_supported = sum(1 for r in self.results.values() if r['supported'])
        if total_tested > 0:
            report.append(f"Total hypotheses supported: {total_supported}/{total_tested}")

        return '\n'.join(report)