"""
Field Intelligence System Research - Statistical Power Analysis
Optimal sample size calculations for detecting FIS effects
"""

import numpy as np
from scipy import stats
from statsmodels.stats.power import TTestPower, NormalIndPower
import matplotlib.pyplot as plt

class FISPowerAnalysis:
    """
    Calculate optimal sample sizes for Field Intelligence System research
    """

    def __init__(self, alpha=0.05, power=0.80):
        self.alpha = alpha
        self.power = power
        self.power_calc = TTestPower()

    def calculate_breakthrough_detection(self):
        """
        Sample size for detecting 3x increase in breakthrough rate
        """
        # Baseline breakthrough rate: 2.4%
        # FIS expected rate: 8.7%
        p1 = 0.024
        p2 = 0.087

        # Convert to effect size (Cohen's h)
        h = 2 * (np.arcsin(np.sqrt(p2)) - np.arcsin(np.sqrt(p1)))

        # Calculate required sample size
        n = self.power_calc.solve_power(
            effect_size=h,
            power=self.power,
            alpha=self.alpha
        )

        return {
            'metric': 'Breakthrough Rate',
            'control_rate': p1,
            'fis_rate': p2,
            'effect_size': h,
            'required_n_per_group': int(np.ceil(n)),
            'total_n': int(np.ceil(n * 2))
        }

    def calculate_authenticity_score(self):
        """
        Sample size for detecting authenticity improvement
        """
        # Control mean: 6.2, FIS mean: 8.7, SD: 1.0
        mean_diff = 8.7 - 6.2
        pooled_sd = 1.0
        effect_size = mean_diff / pooled_sd

        n = self.power_calc.solve_power(
            effect_size=effect_size,
            power=self.power,
            alpha=self.alpha
        )

        return {
            'metric': 'Authenticity Score',
            'control_mean': 6.2,
            'fis_mean': 8.7,
            'effect_size': effect_size,
            'required_n_per_group': int(np.ceil(n)),
            'total_n': int(np.ceil(n * 2))
        }

    def calculate_restraint_ratio(self):
        """
        Sample size for detecting restraint improvement
        """
        # Control: 34% restraint, FIS: 89% restraint
        mean_diff = 0.89 - 0.34
        pooled_sd = 0.45  # Estimated
        effect_size = mean_diff / pooled_sd

        n = self.power_calc.solve_power(
            effect_size=effect_size,
            power=self.power,
            alpha=self.alpha
        )

        return {
            'metric': 'Restraint Ratio',
            'control_ratio': 0.34,
            'fis_ratio': 0.89,
            'effect_size': effect_size,
            'required_n_per_group': int(np.ceil(n)),
            'total_n': int(np.ceil(n * 2))
        }

    def calculate_trust_velocity(self):
        """
        Sample size for detecting trust acceleration
        """
        # 158% acceleration expected
        control_slope = 0.12
        fis_slope = 0.31
        mean_diff = fis_slope - control_slope
        pooled_sd = 0.15  # Estimated
        effect_size = mean_diff / pooled_sd

        n = self.power_calc.solve_power(
            effect_size=effect_size,
            power=self.power,
            alpha=self.alpha
        )

        return {
            'metric': 'Trust Velocity',
            'control_slope': control_slope,
            'fis_slope': fis_slope,
            'acceleration': f"{(fis_slope/control_slope - 1)*100:.0f}%",
            'effect_size': effect_size,
            'required_n_per_group': int(np.ceil(n)),
            'total_n': int(np.ceil(n * 2))
        }

    def calculate_sacred_recognition(self):
        """
        Sample size for detecting sacred threshold recognition
        """
        # Control: 31% recognition, FIS: 85% recognition
        p1 = 0.31
        p2 = 0.85

        h = 2 * (np.arcsin(np.sqrt(p2)) - np.arcsin(np.sqrt(p1)))

        n = self.power_calc.solve_power(
            effect_size=h,
            power=self.power,
            alpha=self.alpha
        )

        return {
            'metric': 'Sacred Threshold Recognition',
            'control_rate': p1,
            'fis_rate': p2,
            'effect_size': h,
            'required_n_per_group': int(np.ceil(n)),
            'total_n': int(np.ceil(n * 2))
        }

    def calculate_optimal_sample_size(self):
        """
        Determine optimal N for all metrics with desired power
        """
        metrics = [
            self.calculate_breakthrough_detection(),
            self.calculate_authenticity_score(),
            self.calculate_restraint_ratio(),
            self.calculate_trust_velocity(),
            self.calculate_sacred_recognition()
        ]

        # Find maximum required N
        max_n = max([m['required_n_per_group'] for m in metrics])

        # Calculate actual power for each metric at N=150
        target_n = 150
        actual_powers = {}

        for metric in metrics:
            actual_power = self.power_calc.solve_power(
                effect_size=metric['effect_size'],
                nobs=target_n,
                alpha=self.alpha
            )
            actual_powers[metric['metric']] = actual_power

        return {
            'minimum_n_required': max_n,
            'recommended_n': target_n,
            'total_participants': target_n * 4,  # 4 conditions
            'actual_powers_at_150': actual_powers,
            'metric_requirements': metrics
        }

    def generate_power_curves(self):
        """
        Generate power curves for different sample sizes
        """
        sample_sizes = np.arange(20, 300, 10)

        # Calculate power for each metric at different sample sizes
        metrics_data = {
            'Breakthrough': (0.35, 'Medium Effect'),
            'Authenticity': (2.5, 'Very Large Effect'),
            'Restraint': (1.22, 'Large Effect'),
            'Trust': (1.27, 'Large Effect'),
            'Sacred': (1.18, 'Large Effect')
        }

        power_curves = {}
        for metric, (effect_size, description) in metrics_data.items():
            powers = []
            for n in sample_sizes:
                power = self.power_calc.solve_power(
                    effect_size=effect_size,
                    nobs=n,
                    alpha=self.alpha
                )
                powers.append(power)
            power_curves[metric] = {
                'sample_sizes': sample_sizes,
                'powers': powers,
                'effect_size': effect_size,
                'description': description
            }

        return power_curves

    def calculate_minimum_viable_study(self):
        """
        Calculate minimum N for pilot study (70% power)
        """
        pilot_power = 0.70
        pilot_calc = TTestPower()

        # Only detect large effects in pilot
        large_effect = 0.8

        n = pilot_calc.solve_power(
            effect_size=large_effect,
            power=pilot_power,
            alpha=self.alpha
        )

        return {
            'pilot_n_per_condition': int(np.ceil(n)),
            'pilot_total_n': int(np.ceil(n * 4)),
            'pilot_power': pilot_power,
            'detectable_effect_size': large_effect,
            'timeline': '2 weeks',
            'limitations': 'Can only detect large effects'
        }

    def calculate_conversation_requirements(self):
        """
        Calculate required number of conversations per user
        """
        return {
            'minimum_conversations': 5,
            'optimal_conversations': 10,
            'depth_threshold': 3,  # Conversations to reach vulnerability
            'total_messages_minimum': 50,
            'expected_dropout': 0.20,
            'total_conversations_needed': {
                'pilot': 80 * 5,  # 400
                'main': 600 * 10,  # 6000
                'replication': 300 * 8  # 2400
            }
        }

    def calculate_budget(self):
        """
        Calculate research budget based on sample size
        """
        costs = {
            'recruitment_per_user': 5,
            'incentive_per_user': 10,
            'evaluation_per_conversation': 2,
            'conversations_per_user': 10,
            'human_eval_percentage': 0.30
        }

        n_total = 750  # Including dropout buffer

        recruitment_cost = n_total * costs['recruitment_per_user']
        incentive_cost = n_total * costs['incentive_per_user']

        total_conversations = 600 * costs['conversations_per_user']
        eval_conversations = total_conversations * costs['human_eval_percentage']
        evaluation_cost = eval_conversations * costs['evaluation_per_conversation']

        total_budget = recruitment_cost + incentive_cost + evaluation_cost + 5000  # Infrastructure

        return {
            'recruitment': recruitment_cost,
            'incentives': incentive_cost,
            'evaluation': evaluation_cost,
            'infrastructure': 5000,
            'total': total_budget,
            'cost_per_participant': total_budget / n_total
        }

def generate_study_report():
    """
    Generate comprehensive power analysis report
    """
    analyzer = FISPowerAnalysis(alpha=0.05, power=0.80)

    print("="*60)
    print("FIELD INTELLIGENCE SYSTEM RESEARCH")
    print("Statistical Power Analysis Report")
    print("="*60)

    # Optimal sample size
    optimal = analyzer.calculate_optimal_sample_size()
    print(f"\nOPTIMAL SAMPLE SIZE:")
    print(f"  Recommended N per condition: {optimal['recommended_n']}")
    print(f"  Total participants (4 conditions): {optimal['total_participants']}")
    print(f"  Minimum required N: {optimal['minimum_n_required']}")

    print(f"\nACTUAL POWER AT N=150:")
    for metric, power in optimal['actual_powers_at_150'].items():
        print(f"  {metric}: {power:.3f}")

    print(f"\nMETRIC-SPECIFIC REQUIREMENTS:")
    for metric in optimal['metric_requirements']:
        print(f"\n  {metric['metric']}:")
        print(f"    Effect size: {metric['effect_size']:.2f}")
        print(f"    Required N: {metric['required_n_per_group']}")
        print(f"    Total N: {metric['total_n']}")

    # Pilot study
    pilot = analyzer.calculate_minimum_viable_study()
    print(f"\nMINIMUM VIABLE PILOT:")
    print(f"  N per condition: {pilot['pilot_n_per_condition']}")
    print(f"  Total N: {pilot['pilot_total_n']}")
    print(f"  Power: {pilot['pilot_power']}")
    print(f"  Timeline: {pilot['timeline']}")

    # Conversation requirements
    conv_req = analyzer.calculate_conversation_requirements()
    print(f"\nCONVERSATION REQUIREMENTS:")
    print(f"  Minimum per user: {conv_req['minimum_conversations']}")
    print(f"  Optimal per user: {conv_req['optimal_conversations']}")
    print(f"  Total conversations (main): {conv_req['total_conversations_needed']['main']}")

    # Budget
    budget = analyzer.calculate_budget()
    print(f"\nBUDGET ESTIMATE:")
    print(f"  Recruitment: ${budget['recruitment']:,}")
    print(f"  Incentives: ${budget['incentives']:,}")
    print(f"  Evaluation: ${budget['evaluation']:,}")
    print(f"  Infrastructure: ${budget['infrastructure']:,}")
    print(f"  TOTAL: ${budget['total']:,}")
    print(f"  Cost per participant: ${budget['cost_per_participant']:.2f}")

    print("\n" + "="*60)
    print("RECOMMENDATION:")
    print("Start with 80-person pilot to validate instruments,")
    print("then scale to 600 participants for main study.")
    print("This provides >90% power for all primary hypotheses.")
    print("="*60)

if __name__ == "__main__":
    generate_study_report()

    # Generate power curves visualization
    analyzer = FISPowerAnalysis()
    power_curves = analyzer.generate_power_curves()

    # Plot power curves
    plt.figure(figsize=(12, 8))
    for metric, data in power_curves.items():
        plt.plot(data['sample_sizes'], data['powers'],
                label=f"{metric} (d={data['effect_size']:.2f})")

    plt.axhline(y=0.80, color='r', linestyle='--', label='Target Power (0.80)')
    plt.axvline(x=150, color='g', linestyle='--', label='Recommended N (150)')

    plt.xlabel('Sample Size per Group')
    plt.ylabel('Statistical Power')
    plt.title('Power Analysis for Field Intelligence System Research')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.xlim(20, 300)
    plt.ylim(0, 1)

    # Save figure
    plt.savefig('/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/research/power_curves.png', dpi=300)
    print("\nPower curves saved to research/power_curves.png")