#!/usr/bin/env python3
"""
Maya Beta Analytics CLI
Automated weekly analytics with delta tracking and Obsidian integration
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
import requests
from typing import Dict, Optional, Any

# Import your analytics modules
from enhanced_beta_analytics import EnhancedBetaAnalyzer
from generate_report import generate_complete_report
from data_loader import load_weekly_data_from_supabase


class MayaAnalyticsCLI:
    """Main CLI controller for Maya analytics"""

    def __init__(self):
        self.config_path = Path("beta_config.json")
        self.archive_dir = Path("archive")
        self.vault_path = Path(os.environ.get(
            "OBSIDIAN_VAULT_PATH",
            "/path/to/Soullab Dev Team Vault/Beta Reports"
        ))
        self.slack_webhook = os.environ.get("SLACK_WEBHOOK_URL")

        # Ensure directories exist
        self.archive_dir.mkdir(exist_ok=True)
        self.vault_path.mkdir(parents=True, exist_ok=True)

    def get_current_week(self) -> int:
        """Auto-detect current week based on launch date"""
        if not self.config_path.exists():
            print("⚠️  No beta_config.json found. Initializing...")
            return self.initialize_config()

        with open(self.config_path) as f:
            config = json.load(f)

        launch = datetime.strptime(config["launch_date"], "%Y-%m-%d")
        now = datetime.now()
        week = (now - launch).days // 7 + 1
        return max(1, week)  # Ensure minimum week 1

    def initialize_config(self) -> int:
        """Initialize beta configuration"""
        config = {
            "launch_date": datetime.now().strftime("%Y-%m-%d"),
            "research_protocol": "spiralogic",
            "cohorts": {
                "control": 150,
                "water": 150,
                "fire": 150,
                "earth": 150,
                "air": 150,
                "aether": 150,
                "orchestrated": 150,
                "adaptive": 150
            },
            "targets": {
                "breakthrough_rate": 9.4,
                "restraint_ratio": 0.8,
                "trust_velocity": 4.1,
                "authenticity_score": 8.8
            }
        }

        with open(self.config_path, 'w') as f:
            json.dump(config, f, indent=2)

        print(f"✅ Initialized beta_config.json with launch date: {config['launch_date']}")
        return 1

    def load_previous_metrics(self, week_num: int) -> Optional[Dict]:
        """Load last week's metrics for delta comparison"""
        if week_num <= 1:
            return None

        prev_summary = self.archive_dir / f"week{week_num-1}" / "summary.json"

        if prev_summary.exists():
            with open(prev_summary) as f:
                return json.load(f)
        return None

    def save_current_metrics(self, week_num: int, metrics: Dict):
        """Archive current week's metrics and raw data"""
        week_dir = self.archive_dir / f"week{week_num}"
        week_dir.mkdir(parents=True, exist_ok=True)

        # Save summary
        with open(week_dir / "summary.json", 'w') as f:
            json.dump(metrics, f, indent=2)

        # Save timestamp
        with open(week_dir / "generated.txt", 'w') as f:
            f.write(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    def calculate_deltas(self, current: Dict, previous: Optional[Dict]) -> Dict:
        """Calculate week-over-week changes"""
        if not previous:
            return {}

        deltas = {}
        for key in current:
            if key in previous and isinstance(current[key], (int, float)):
                curr_val = current[key]
                prev_val = previous[key]

                if prev_val != 0:
                    delta = curr_val - prev_val
                    pct_change = (delta / prev_val * 100)

                    # Determine trend emoji
                    if abs(pct_change) < 5:
                        arrow = "➡️"
                    elif pct_change > 0:
                        arrow = "📈" if pct_change > 20 else "↗️"
                    else:
                        arrow = "📉" if pct_change < -20 else "↘️"

                    deltas[key] = {
                        'value': delta,
                        'percent': pct_change,
                        'display': f"{arrow} {delta:+.1f} ({pct_change:+.1f}%)",
                        'trend': arrow
                    }

        return deltas

    def execute_analytics(self, week_num: int) -> Dict:
        """Run the actual analytics pipeline"""
        print(f"📊 Executing analytics for Week {week_num}...")

        # Initialize analyzer
        analyzer = EnhancedBetaAnalyzer(week_num=week_num)

        # Load data from Supabase
        data = load_weekly_data_from_supabase(week_num)

        # Generate visualizations
        dashboard_fig = analyzer.create_comprehensive_dashboard(data)

        # Save dashboard to vault
        dashboard_path = self.vault_path / f"dashboards/week{week_num}_dashboard.html"
        dashboard_path.parent.mkdir(exist_ok=True)
        dashboard_fig.write_html(str(dashboard_path))

        # Extract key metrics
        metrics = {
            "week": week_num,
            "generated_at": datetime.now().isoformat(),
            "breakthrough_rate": float(data['breakthroughs']['breakthrough_rate'].mean() or 0),
            "total_conversations": int(data['breakthroughs']['conversations'].sum() or 0),
            "satisfaction": int(data['feedback'][data['feedback']['rating']=="helpful"]["count"].sum() or 0),
            "avg_depth": float(data['depth']['avg_depth'].mean() or 0),
            "restraint_ratio": float(data['restraint']['ratio'].mean() or 1.0),
            "trust_velocity": float(data['trust']['velocity'].mean() or 7.0),
            "authenticity_score": float(data['authenticity']['score'].mean() or 6.0),
            "sacred_threshold_accuracy": float(data.get('sacred', {}).get('accuracy', 0) or 0),
            "firewall_integrity": float(data.get('firewall', {}).get('integrity', 0) or 0),
            "total_breakthroughs": int(data['breakthroughs']['total'].sum() or 0)
        }

        return metrics

    def generate_report(self, week_num: int, metrics: Dict, deltas: Dict) -> str:
        """Generate the complete weekly report with deltas"""
        # Load config for targets
        with open(self.config_path) as f:
            config = json.load(f)
        targets = config.get('targets', {})

        # Generate delta section
        delta_section = self.generate_delta_section(metrics,
                                                   self.load_previous_metrics(week_num),
                                                   deltas,
                                                   targets)

        # Generate main report content
        report = f"""# 📊 Maya Beta Analytics - Week {week_num}
*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}*

---

## 🎯 Executive Summary

**Week {week_num} Performance**
- **Total Conversations**: {metrics['total_conversations']:,}
- **Total Breakthroughs**: {metrics['total_breakthroughs']}
- **Overall Breakthrough Rate**: {metrics['breakthrough_rate']:.1f}%
- **User Satisfaction**: {metrics['satisfaction']}%

{delta_section}

## 📈 Core Metrics vs Targets

| Metric | Current | Target | Status | Progress |
|--------|---------|--------|--------|----------|
| Breakthrough Rate | {metrics['breakthrough_rate']:.1f}% | {targets.get('breakthrough_rate', 9.4)}% | {"✅" if metrics['breakthrough_rate'] >= targets.get('breakthrough_rate', 9.4) else "⏳"} | {self.progress_bar(metrics['breakthrough_rate'], targets.get('breakthrough_rate', 9.4))} |
| Restraint Ratio | {metrics['restraint_ratio']:.2f} | {targets.get('restraint_ratio', 0.8)} | {"✅" if metrics['restraint_ratio'] <= targets.get('restraint_ratio', 0.8) else "⏳"} | {self.progress_bar(1/metrics['restraint_ratio'], 1/targets.get('restraint_ratio', 0.8))} |
| Trust Velocity | {metrics['trust_velocity']:.1f} | {targets.get('trust_velocity', 4.1)} | {"✅" if metrics['trust_velocity'] <= targets.get('trust_velocity', 4.1) else "⏳"} | {self.progress_bar(1/metrics['trust_velocity'], 1/targets.get('trust_velocity', 4.1))} |
| Authenticity | {metrics['authenticity_score']:.1f}/10 | {targets.get('authenticity_score', 8.8)}/10 | {"✅" if metrics['authenticity_score'] >= targets.get('authenticity_score', 8.8) else "⏳"} | {self.progress_bar(metrics['authenticity_score'], targets.get('authenticity_score', 8.8))} |

## 🔬 Novel Metrics (No Traditional Baseline)

- **Sacred Threshold Recognition**: {metrics['sacred_threshold_accuracy']:.1f}% accuracy
- **Firewall Integrity**: {metrics['firewall_integrity']:.1f}% maintained
- **Average Conversation Depth**: {metrics['avg_depth']:.2f}

## 📊 Visualizations

Interactive dashboard available at: `dashboards/week{week_num}_dashboard.html`

## 🔍 Key Insights This Week

{self.generate_insights(metrics, deltas)}

## 📋 Action Items

{self.generate_action_items(metrics, targets, deltas)}

---

*Next report: Week {week_num + 1} - {(datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')}*
"""
        return report

    def generate_delta_section(self, current: Dict, previous: Optional[Dict],
                               deltas: Dict, targets: Dict) -> str:
        """Generate the delta comparison section"""
        if not previous:
            return "\n*Note: No previous week data for comparison (Week 1)*\n"

        return f"""
## 📈 Week-over-Week Changes

| Metric | This Week | Last Week | Change | Trend |
|--------|-----------|-----------|--------|-------|
| Breakthrough Rate | {current['breakthrough_rate']:.1f}% | {previous.get('breakthrough_rate', 0):.1f}% | {deltas.get('breakthrough_rate', {}).get('display', '–')} | {self.get_trend_indicator(deltas.get('breakthrough_rate', {}))} |
| Avg Depth | {current['avg_depth']:.2f} | {previous.get('avg_depth', 0):.2f} | {deltas.get('avg_depth', {}).get('display', '–')} | {self.get_trend_indicator(deltas.get('avg_depth', {}))} |
| Trust Velocity | {current['trust_velocity']:.1f} | {previous.get('trust_velocity', 0):.1f} | {deltas.get('trust_velocity', {}).get('display', '–')} | {self.get_trend_indicator(deltas.get('trust_velocity', {}), inverse=True)} |
| Satisfaction | {current['satisfaction']:.0f}% | {previous.get('satisfaction', 0):.0f}% | {deltas.get('satisfaction', {}).get('display', '–')} | {self.get_trend_indicator(deltas.get('satisfaction', {}))} |

### Trajectory Analysis
- **Momentum**: {self.assess_momentum(deltas)}
- **Stability**: {self.assess_stability(deltas)}
- **Target Progress**: {self.assess_progress(current, targets)}
"""

    def get_trend_indicator(self, delta: Dict, inverse: bool = False) -> str:
        """Get trend indicator based on delta"""
        if not delta:
            return "➖"

        pct = delta.get('percent', 0)
        if inverse:  # For metrics where lower is better
            pct = -pct

        if abs(pct) < 5:
            return "➖ Stable"
        elif pct > 20:
            return "🔥 Strong improvement"
        elif pct > 0:
            return "📈 Improving"
        elif pct < -20:
            return "⚠️ Declining"
        else:
            return "📉 Slight decline"

    def assess_momentum(self, deltas: Dict) -> str:
        """Assess overall momentum from deltas"""
        if not deltas:
            return "Establishing baseline"

        positive = sum(1 for d in deltas.values() if d.get('value', 0) > 0)
        total = len(deltas)

        if positive > total * 0.7:
            return "🚀 Strong positive momentum"
        elif positive > total * 0.5:
            return "↗️ Positive trajectory"
        elif positive > total * 0.3:
            return "➡️ Mixed signals"
        else:
            return "⚠️ Needs attention"

    def assess_stability(self, deltas: Dict) -> str:
        """Assess metric stability"""
        if not deltas:
            return "First week - no variance data"

        high_variance = [k for k, v in deltas.items()
                        if abs(v.get('percent', 0)) > 50]

        if not high_variance:
            return "✅ All metrics within normal range"
        else:
            return f"⚠️ High variance in: {', '.join(high_variance)}"

    def assess_progress(self, current: Dict, targets: Dict) -> str:
        """Assess progress toward targets"""
        on_track = sum(1 for k, v in targets.items()
                      if k in current and self.is_on_track(current[k], v, k))
        total = len(targets)

        pct = (on_track / total * 100) if total > 0 else 0

        if pct >= 80:
            return f"🎯 {on_track}/{total} metrics on target"
        elif pct >= 50:
            return f"📊 {on_track}/{total} metrics meeting targets"
        else:
            return f"⏳ {on_track}/{total} metrics at target - review needed"

    def is_on_track(self, current: float, target: float, metric: str) -> bool:
        """Check if metric is on track (some metrics want lower values)"""
        inverse_metrics = ['restraint_ratio', 'trust_velocity']
        if metric in inverse_metrics:
            return current <= target
        return current >= target

    def progress_bar(self, current: float, target: float) -> str:
        """Generate a simple text progress bar"""
        pct = min(100, (current / target * 100) if target > 0 else 0)
        filled = int(pct / 10)
        empty = 10 - filled
        return f"{'█' * filled}{'░' * empty} {pct:.0f}%"

    def generate_insights(self, metrics: Dict, deltas: Dict) -> str:
        """Generate automated insights from metrics"""
        insights = []

        # Breakthrough performance
        if metrics['breakthrough_rate'] > 8:
            insights.append(f"🎯 Breakthrough rate ({metrics['breakthrough_rate']:.1f}%) exceeding traditional baseline by {(metrics['breakthrough_rate']/2.4 - 1)*100:.0f}%")

        # Trust velocity
        if metrics['trust_velocity'] < 5:
            insights.append(f"⚡ Users reaching depth {(7.2/metrics['trust_velocity'] - 1)*100:.0f}% faster than control")

        # Sacred threshold (novel metric)
        if metrics['sacred_threshold_accuracy'] > 70:
            insights.append(f"🌟 Sacred threshold recognition at {metrics['sacred_threshold_accuracy']:.0f}% - no traditional baseline exists")

        # Week-over-week momentum
        if deltas:
            improving = sum(1 for d in deltas.values() if d.get('value', 0) > 0)
            if improving > len(deltas) * 0.6:
                insights.append("📈 Majority of metrics showing week-over-week improvement")

        return "\n".join([f"- {i}" for i in insights]) if insights else "- Gathering baseline data..."

    def generate_action_items(self, metrics: Dict, targets: Dict, deltas: Dict) -> str:
        """Generate action items based on performance"""
        actions = []

        # Check underperforming metrics
        for metric, target in targets.items():
            if metric in metrics:
                if not self.is_on_track(metrics[metric], target, metric):
                    actions.append(f"Review {metric}: currently {metrics[metric]:.1f}, target {target}")

        # High variance metrics
        if deltas:
            volatile = [k for k, v in deltas.items()
                       if abs(v.get('percent', 0)) > 30]
            if volatile:
                actions.append(f"Investigate high variance in: {', '.join(volatile)}")

        # Cohort balance check
        if metrics.get('total_conversations', 0) < 500:
            actions.append("Increase conversation volume for statistical significance")

        return "\n".join([f"- [ ] {a}" for a in actions]) if actions else "- [x] All systems performing within expected parameters"

    def save_report_to_vault(self, week_num: int, report: str):
        """Save report to Obsidian vault"""
        report_path = self.vault_path / f"Week {week_num} Report.md"

        with open(report_path, 'w') as f:
            f.write(report)

        print(f"📝 Report saved to: {report_path}")

    def send_slack_notification(self, week_num: int, metrics: Dict, deltas: Dict):
        """Send Slack notification with key metrics"""
        if not self.slack_webhook:
            print("ℹ️  No Slack webhook configured")
            return

        # Build notification message
        message = {
            "text": f"📊 Maya Beta Week {week_num} Report Ready",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"Maya Beta Analytics - Week {week_num}"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Conversations:*\n{metrics['total_conversations']:,}"},
                        {"type": "mrkdwn", "text": f"*Breakthroughs:*\n{metrics['breakthrough_rate']:.1f}%"},
                        {"type": "mrkdwn", "text": f"*Trust Velocity:*\n{metrics['trust_velocity']:.1f}"},
                        {"type": "mrkdwn", "text": f"*Authenticity:*\n{metrics['authenticity_score']:.1f}/10"}
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Momentum:* {self.assess_momentum(deltas)}"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"📂 Full report in Obsidian: `Beta Reports/Week {week_num} Report.md`"
                    }
                }
            ]
        }

        try:
            response = requests.post(self.slack_webhook, json=message)
            if response.status_code == 200:
                print("📨 Slack notification sent")
            else:
                print(f"⚠️  Slack notification failed: {response.status_code}")
        except Exception as e:
            print(f"⚠️  Slack notification error: {e}")

    def run_analysis(self, week_num: Optional[int] = None,
                    archive: bool = False,
                    notify: bool = False,
                    force: bool = False) -> Dict:
        """Execute full analysis pipeline"""
        # Auto-detect week if not specified
        if week_num is None:
            week_num = self.get_current_week()
            print(f"📅 Auto-detected Week {week_num}")
        else:
            print(f"📅 Running analysis for specified Week {week_num}")

        # Check if already run (unless forced)
        current_report = self.vault_path / f"Week {week_num} Report.md"
        if current_report.exists() and not force:
            print(f"ℹ️  Week {week_num} report already exists. Use --force to regenerate.")
            return {}

        # Load previous metrics for deltas
        prev_metrics = self.load_previous_metrics(week_num)

        # Execute analytics
        current_metrics = self.execute_analytics(week_num)

        # Calculate deltas
        deltas = self.calculate_deltas(current_metrics, prev_metrics)

        # Generate report
        report = self.generate_report(week_num, current_metrics, deltas)

        # Save to vault
        self.save_report_to_vault(week_num, report)

        # Archive if requested
        if archive:
            self.save_current_metrics(week_num, current_metrics)
            print(f"📂 Archived to: {self.archive_dir}/week{week_num}/")

        # Send notification if requested
        if notify:
            self.send_slack_notification(week_num, current_metrics, deltas)

        print(f"✅ Week {week_num} analysis complete!")
        return current_metrics

    def show_status(self):
        """Show current status and configuration"""
        current_week = self.get_current_week()

        with open(self.config_path) as f:
            config = json.load(f)

        print(f"""
╔══════════════════════════════════════════╗
║         Maya Beta Analytics Status        ║
╠══════════════════════════════════════════╣
║ Current Week:     {current_week:<24} ║
║ Launch Date:      {config['launch_date']:<24} ║
║ Protocol:         {config['research_protocol']:<24} ║
║ Archive Count:    {len(list(self.archive_dir.glob('week*'))):<24} ║
║ Vault Path:       {str(self.vault_path)[:24]:<24} ║
╚══════════════════════════════════════════╝

Cohort Sizes:
{json.dumps(config['cohorts'], indent=2)}

Target Metrics:
{json.dumps(config['targets'], indent=2)}
        """)

    def compare_weeks(self):
        """Interactive week comparison tool"""
        weeks = sorted([int(d.name.replace('week', ''))
                       for d in self.archive_dir.glob('week*')])

        if len(weeks) < 2:
            print("Need at least 2 weeks of data for comparison")
            return

        print(f"Available weeks: {weeks}")
        w1 = int(input("Compare week: "))
        w2 = int(input("With week: "))

        # Load both weeks
        week1_data = json.load(open(self.archive_dir / f"week{w1}" / "summary.json"))
        week2_data = json.load(open(self.archive_dir / f"week{w2}" / "summary.json"))

        # Calculate differences
        print(f"\n📊 Week {w1} vs Week {w2} Comparison:")
        print("=" * 50)

        for metric in week1_data:
            if metric in week2_data and isinstance(week1_data[metric], (int, float)):
                val1 = week1_data[metric]
                val2 = week2_data[metric]
                diff = val2 - val1
                pct = (diff / val1 * 100) if val1 != 0 else 0

                arrow = "📈" if diff > 0 else "📉" if diff < 0 else "➡️"
                print(f"{metric:.<30} {arrow} {diff:+.1f} ({pct:+.1f}%)")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Maya Beta Analytics CLI - Auto-generates weekly reports with delta tracking',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  maya-analytics                    # Run for current week (auto-detected)
  maya-analytics --week 3           # Run for specific week
  maya-analytics --archive          # Archive data for reproducibility
  maya-analytics --notify           # Send Slack notification
  maya-analytics init               # Initialize configuration
  maya-analytics status             # Show current status
  maya-analytics compare            # Compare two weeks interactively
        """
    )

    parser.add_argument('command', nargs='?', default='analyze',
                       choices=['analyze', 'init', 'status', 'compare'],
                       help='Command to run (default: analyze)')
    parser.add_argument('--week', type=int,
                       help='Override week number (default: auto-detect)')
    parser.add_argument('--archive', action='store_true',
                       help='Archive raw data and summary for delta tracking')
    parser.add_argument('--notify', action='store_true',
                       help='Send Slack notification after completion')
    parser.add_argument('--force', action='store_true',
                       help='Force regeneration even if report exists')
    parser.add_argument('--open', action='store_true',
                       help='Open report in Obsidian after generation')
    parser.add_argument('--debug', action='store_true',
                       help='Enable debug output')

    args = parser.parse_args()

    # Set debug mode
    if args.debug:
        import logging
        logging.basicConfig(level=logging.DEBUG)

    # Initialize CLI
    cli = MayaAnalyticsCLI()

    try:
        if args.command == 'init':
            cli.initialize_config()
        elif args.command == 'status':
            cli.show_status()
        elif args.command == 'compare':
            cli.compare_weeks()
        else:  # analyze
            metrics = cli.run_analysis(
                week_num=args.week,
                archive=args.archive,
                notify=args.notify,
                force=args.force
            )

            # Open in Obsidian if requested
            if args.open and metrics:
                week = args.week or cli.get_current_week()
                report_path = cli.vault_path / f"Week {week} Report.md"
                if sys.platform == "darwin":  # macOS
                    os.system(f"open 'obsidian://open?path={report_path}'")
                elif sys.platform == "linux":
                    os.system(f"xdg-open 'obsidian://open?path={report_path}'")
                else:  # Windows
                    os.system(f"start obsidian://open?path={report_path}")

    except KeyboardInterrupt:
        print("\n⚠️  Analysis cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        if args.debug:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()