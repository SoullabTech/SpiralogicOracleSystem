#!/usr/bin/env python3
"""
Maya Analytics CLI - Beta Testing Analytics Automation
Spiralogic Oracle System
"""

import os
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
import click
import pandas as pd
from tabulate import tabulate
from analytics.archiver import WeeklyArchiver, load_previous_metrics
from analytics.delta_visualizer import DeltaVisualizer
from analytics.data_validator import DataValidator
from analytics.hypothesis_registry import HypothesisRegistry

class MayaAnalyticsCLI:
    def __init__(self):
        self.config_dir = Path.home() / '.maya'
        self.config_file = self.config_dir / 'config.json'
        self.reports_dir = self.config_dir / 'reports'
        self.BETA_START = datetime(2025, 1, 15)

    def init_config(self):
        """Initialize configuration directory and files"""
        self.config_dir.mkdir(exist_ok=True)
        self.reports_dir.mkdir(exist_ok=True)

        if not self.config_file.exists():
            default_config = {
                "supabase_url": "your-project-url",
                "supabase_key": "your-anon-key",
                "obsidian_vault": str(Path.home() / "Obsidian" / "MayaBeta"),
                "auto_push": False,
                "week_start": "monday",
                "timezone": "UTC"
            }

            with open(self.config_file, 'w') as f:
                json.dump(default_config, f, indent=2)

            click.echo(f"✅ Created config at {self.config_file}")
            click.echo("📝 Please update with your Supabase credentials")
        else:
            click.echo(f"Config already exists at {self.config_file}")

    def load_config(self):
        """Load configuration"""
        if not self.config_file.exists():
            click.echo("❌ Config not found. Run 'maya-analytics init' first")
            sys.exit(1)

        with open(self.config_file) as f:
            return json.load(f)

    def auto_detect_week(self):
        """Auto-detect current beta week"""
        days_since_start = (datetime.now() - self.BETA_START).days
        return max(1, (days_since_start // 7) + 1)

    def run_analytics(self, week=None, auto=False, skip_validation=False):
        """Run analytics for specified week with validation and hypothesis testing"""
        config = self.load_config()

        if week is None:
            week = self.auto_detect_week()
            click.echo(f"🔍 Auto-detected Week {week}")

        click.echo(f"📊 Running analytics for Week {week}...")

        # Import and run the analytics script
        try:
            from beta_analytics_complete import run_week_analysis, BetaAnalytics
            from supabase import create_client

            # Initialize Supabase client for validation
            supabase = create_client(config['supabase_url'], config['supabase_key'])
            analyzer = BetaAnalytics(config['supabase_url'], config['supabase_key'])

            # Fetch raw data for validation
            click.echo("📥 Fetching data...")
            data = analyzer.fetch_week_data(week)

            # Run data validation unless skipped
            if not skip_validation:
                click.echo("✅ Validating data quality...")
                validator = DataValidator(supabase)
                validation_results = validator.validate_week_data(week, data)

                # Display validation summary
                quality_score = validation_results['quality_score']
                score_emoji = "✅" if quality_score >= 80 else "⚠️" if quality_score >= 60 else "❌"
                click.echo(f"{score_emoji} Data Quality Score: {quality_score}/100")

                if validation_results['errors']:
                    click.echo("❌ Critical errors found:")
                    for error in validation_results['errors']:
                        click.echo(f"   - {error}")

                if validation_results['warnings']:
                    click.echo("⚠️ Warnings:")
                    for warning in validation_results['warnings']:
                        click.echo(f"   - {warning}")

                # Save validation report
                validation_report = validator.generate_validation_report(validation_results, week)
                validation_path = self.reports_dir / f'week_{week}_validation.md'
                with open(validation_path, 'w') as f:
                    f.write(validation_report)
                click.echo(f"📝 Validation report saved to {validation_path}")

                # Abort if validation fails critically
                if not validation_results['valid']:
                    click.echo("❌ Data validation failed. Please address errors before proceeding.")
                    if not click.confirm("Continue anyway?"):
                        return

            # Run the main analysis
            results = run_week_analysis(
                week=week,
                supabase_url=config['supabase_url'],
                supabase_key=config['supabase_key'],
                output_dir=str(self.reports_dir)
            )

            # Display summary
            if results:
                self.display_summary(results, week)

                # Save to Obsidian if configured
                if config.get('obsidian_vault'):
                    self.save_to_obsidian(results, week, config['obsidian_vault'])

                # Track deltas
                self.track_deltas(results, week)

            click.echo(f"✅ Analytics complete for Week {week}")

        except Exception as e:
            click.echo(f"❌ Error running analytics: {e}")
            sys.exit(1)

    def display_summary(self, results, week):
        """Display analytics summary"""
        click.echo("\n📈 Week {} Summary".format(week))
        click.echo("=" * 50)

        summary_data = []

        if 'engagement' in results:
            eng = results['engagement']
            summary_data.append(["Active Users", eng.get('active_users', 0)])
            summary_data.append(["Total Sessions", eng.get('total_sessions', 0)])
            summary_data.append(["Avg Session Duration", f"{eng.get('avg_duration', 0):.1f} min"])

        if 'consciousness' in results:
            cons = results['consciousness']
            summary_data.append(["Breakthrough Events", cons.get('breakthroughs', 0)])
            summary_data.append(["Avg Coherence", f"{cons.get('avg_coherence', 0):.2%}"])

        if 'firewall' in results:
            fw = results['firewall']
            summary_data.append(["Firewall Integrity", f"{fw.get('integrity', 0):.2%}"])

        click.echo(tabulate(summary_data, tablefmt="simple"))

    def track_deltas(self, results, week):
        """Track week-over-week changes"""
        deltas_file = self.reports_dir / 'deltas.json'

        # Load existing deltas
        if deltas_file.exists():
            with open(deltas_file) as f:
                deltas = json.load(f)
        else:
            deltas = {}

        # Update with current week
        deltas[f"week_{week}"] = {
            "timestamp": datetime.now().isoformat(),
            "metrics": results
        }

        # Calculate changes if previous week exists
        if week > 1 and f"week_{week-1}" in deltas:
            prev = deltas[f"week_{week-1}"]["metrics"]
            changes = self.calculate_changes(prev, results)

            click.echo("\n📊 Week-over-Week Changes:")
            click.echo("-" * 40)

            for metric, change in changes.items():
                arrow = "↗️" if change > 0 else "↘️" if change < 0 else "➡️"
                click.echo(f"{arrow} {metric}: {change:+.1%}")

        # Save deltas
        with open(deltas_file, 'w') as f:
            json.dump(deltas, f, indent=2)

    def calculate_changes(self, prev, current):
        """Calculate percentage changes between weeks"""
        changes = {}

        # Compare engagement metrics
        if 'engagement' in prev and 'engagement' in current:
            prev_eng = prev['engagement']
            curr_eng = current['engagement']

            if prev_eng.get('active_users', 0) > 0:
                changes['Active Users'] = (
                    curr_eng.get('active_users', 0) - prev_eng.get('active_users', 0)
                ) / prev_eng.get('active_users', 1)

            if prev_eng.get('total_sessions', 0) > 0:
                changes['Sessions'] = (
                    curr_eng.get('total_sessions', 0) - prev_eng.get('total_sessions', 0)
                ) / prev_eng.get('total_sessions', 1)

        # Compare consciousness metrics
        if 'consciousness' in prev and 'consciousness' in current:
            prev_cons = prev['consciousness']
            curr_cons = current['consciousness']

            if prev_cons.get('avg_coherence', 0) > 0:
                changes['Coherence'] = (
                    curr_cons.get('avg_coherence', 0) - prev_cons.get('avg_coherence', 0)
                ) / prev_cons.get('avg_coherence', 1)

        return changes

    def save_to_obsidian(self, results, week, vault_path):
        """Save report to Obsidian vault and create archive"""
        vault = Path(vault_path)
        if not vault.exists():
            vault.mkdir(parents=True)

        # Create weekly report
        report_path = vault / f"Week_{week}_Report.md"

        with open(report_path, 'w') as f:
            f.write(f"# Maya Beta - Week {week} Report\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")

            # Write engagement section
            if 'engagement' in results:
                f.write("## 📊 Engagement Metrics\n\n")
                eng = results['engagement']
                f.write(f"- **Active Users**: {eng.get('active_users', 0)}\n")
                f.write(f"- **Total Sessions**: {eng.get('total_sessions', 0)}\n")
                f.write(f"- **Avg Duration**: {eng.get('avg_duration', 0):.1f} minutes\n")
                f.write(f"- **Retention Rate**: {eng.get('retention', 0):.1%}\n\n")

            # Write consciousness section
            if 'consciousness' in results:
                f.write("## 🔮 Consciousness Metrics\n\n")
                cons = results['consciousness']
                f.write(f"- **Breakthrough Events**: {cons.get('breakthroughs', 0)}\n")
                f.write(f"- **Avg Coherence**: {cons.get('avg_coherence', 0):.2%}\n")
                f.write(f"- **Peak States**: {cons.get('peak_states', 0)}\n\n")

            # Write firewall section
            if 'firewall' in results:
                f.write("## 🛡️ Elemental Firewall\n\n")
                fw = results['firewall']
                f.write(f"- **Integrity Score**: {fw.get('integrity', 0):.2%}\n")
                f.write(f"- **Voice Distinction**: {fw.get('distinction', 0):.2f}\n\n")

            # Add delta analysis if previous week exists
            if week > 1 and previous_metrics:
                f.write("## 📊 Week-over-Week Delta Analysis\n\n")

                # Calculate deltas for display
                delta_data = []
                for metric_key in ['total_conversations', 'unique_users', 'breakthrough_rate', 'firewall_triggers']:
                    current_val = metrics_data.get(metric_key, 0)
                    prev_val = previous_metrics.get(metric_key, 0)
                    if prev_val > 0:
                        pct_change = ((current_val - prev_val) / prev_val) * 100
                        abs_change = current_val - prev_val
                        delta_data.append({
                            'metric': metric_key,
                            'percentage_change': pct_change,
                            'absolute_change': abs_change,
                            'current': current_val,
                            'previous': prev_val
                        })

                if delta_data:
                    # Generate Top 3 Shifts
                    sorted_deltas = sorted(delta_data, key=lambda x: abs(x['percentage_change']), reverse=True)[:3]

                    f.write("### Top 3 Shifts\n")
                    for delta in sorted_deltas:
                        direction = "📈" if delta['percentage_change'] > 0 else "📉"
                        metric_name = delta['metric'].replace('_', ' ').title()
                        f.write(f"- {direction} **{metric_name}**: {delta['percentage_change']:+.1f}%")
                        if delta['metric'] in ['total_conversations', 'unique_users', 'firewall_triggers']:
                            f.write(f" ({delta['absolute_change']:+.0f})")
                        f.write("\n")

                    # Add delta chart if exists
                    delta_chart_path = vault / f"Week {week} Delta Chart.png"
                    if delta_chart_path.exists():
                        f.write(f"\n![[Week {week} Delta Chart.png]]\n\n")

                    # Generate delta table
                    f.write("\n### Full Delta Table\n\n")
                    f.write("| Metric | Week " + str(week-1) + " | Week " + str(week) + " | Change |\n")
                    f.write("|--------|------------|------------|--------|\n")

                    for delta in delta_data:
                        metric_name = delta['metric'].replace('_', ' ').title()
                        direction = "↗️" if delta['percentage_change'] > 0 else "↘️" if delta['percentage_change'] < 0 else "➡️"

                        if delta['metric'] in ['total_conversations', 'unique_users', 'firewall_triggers']:
                            prev_fmt = f"{delta['previous']:.0f}"
                            curr_fmt = f"{delta['current']:.0f}"
                        elif 'rate' in delta['metric']:
                            prev_fmt = f"{delta['previous']:.1f}%"
                            curr_fmt = f"{delta['current']:.1f}%"
                        else:
                            prev_fmt = f"{delta['previous']:.2f}"
                            curr_fmt = f"{delta['current']:.2f}"

                        change_fmt = f"{direction} {delta['percentage_change']:+.1f}%"
                        f.write(f"| {metric_name} | {prev_fmt} | {curr_fmt} | {change_fmt} |\n")

                    f.write("\n")

            # Add visualizations note using Obsidian embedding
            f.write("## 📈 Visualizations\n\n")
            f.write("![[Week " + str(week) + " Pentagon.png]]\n\n")
            f.write("![[Week " + str(week) + " Heatmap.png]]\n\n")
            f.write("![[Week " + str(week) + " Breakthrough Timeline.png]]\n\n")

        # Copy visualization files to Obsidian vault
        for viz_file in ['pentagon', 'heatmap', 'breakthrough_timeline']:
            src_file = self.reports_dir / f"{viz_file}_week_{week}.png"
            if src_file.exists():
                dest_file = vault / f"Week {week} {viz_file.replace('_', ' ').title()}.png"
                import shutil
                shutil.copy2(src_file, dest_file)

        # Create archive with delta tracking
        archiver = WeeklyArchiver(vault_path)

        # Prepare metrics for archiving
        metrics_data = {
            'total_conversations': results.get('engagement', {}).get('total_sessions', 0),
            'unique_users': results.get('engagement', {}).get('active_users', 0),
            'breakthrough_rate': results.get('consciousness', {}).get('avg_coherence', 0) * 100,
            'firewall_triggers': results.get('firewall', {}).get('triggers', 0)
        }

        # Load previous week metrics for delta calculation
        previous_metrics = None
        if week > 1:
            previous_metrics = load_previous_metrics(week - 1, vault_path)

        # Create archive
        archive_path = archiver.archive_week(week, metrics_data, previous_metrics)

        # Append archive link to report
        with open(report_path, 'a') as f:
            f.write(f"\n## 📦 Data Archive\n")
            f.write(f"Full data package with delta tracking: [[{archive_path.name}]]\n")
            f.write(f"Extract for complete reproducibility of Week {week} analysis.\n\n")
            f.write("---\n")
            f.write("*Report generated by Maya Analytics CLI*\n")

        click.echo(f"📝 Saved report to {report_path}")
        click.echo(f"📦 Created archive: {archive_path.name}")

    def schedule_cron(self):
        """Set up weekly cron job"""
        cron_command = f"0 9 * * MON cd {os.getcwd()} && /usr/bin/env python3 maya_analytics_cli.py run --auto"

        click.echo("📅 Add this to your crontab for weekly reports:")
        click.echo(f"   {cron_command}")
        click.echo("\nRun 'crontab -e' and add the line above")

@click.group()
def cli():
    """Maya Analytics CLI - Beta Testing Analytics"""
    pass

@cli.command()
def init():
    """Initialize Maya Analytics configuration"""
    maya = MayaAnalyticsCLI()
    maya.init_config()

@cli.command()
@click.option('--week', '-w', type=int, help='Week number (auto-detects if not specified)')
@click.option('--auto', is_flag=True, help='Auto-detect week and run')
def run(week, auto):
    """Run analytics for specified week"""
    maya = MayaAnalyticsCLI()
    maya.run_analytics(week=week, auto=auto)

@cli.command()
def status():
    """Check analytics status"""
    maya = MayaAnalyticsCLI()
    config = maya.load_config()

    click.echo("Maya Analytics Status")
    click.echo("=" * 40)
    click.echo(f"Config: {maya.config_file}")
    click.echo(f"Reports: {maya.reports_dir}")
    click.echo(f"Current Week: {maya.auto_detect_week()}")
    click.echo(f"Supabase: {'✅ Configured' if config['supabase_url'] != 'your-project-url' else '❌ Not configured'}")

@cli.command()
def schedule():
    """Set up weekly cron job"""
    maya = MayaAnalyticsCLI()
    maya.schedule_cron()

@cli.command()
def hypotheses():
    """Manage hypothesis registry"""
    registry = HypothesisRegistry()

    click.echo("📊 Hypothesis Registry Status")
    click.echo("=" * 50)

    # Display registry status
    metadata = registry.hypotheses.get('metadata', {})
    if metadata.get('locked'):
        click.echo(f"✅ Locked: {metadata.get('locked_at')}")
        click.echo(f"Integrity: {metadata.get('integrity_hash')}")
    else:
        click.echo("⚠️ Not locked - hypotheses can be modified")

    # Display hypotheses
    click.echo("\nRegistered Hypotheses:")
    for h_id, h in registry.hypotheses.get('hypotheses', {}).items():
        primary = "PRIMARY" if h.get('primary') else "secondary"
        click.echo(f"  {h_id} [{primary}]: {h['description']}")

    # Calculate sample sizes
    click.echo("\n📈 Required Sample Sizes:")
    sample_sizes = registry.calculate_required_sample_sizes()
    for h_id, calc in sample_sizes.items():
        click.echo(f"  {h_id}: {calc.get('total', 'N/A')} total samples")

    # Lock option
    if not metadata.get('locked'):
        if click.confirm("\nLock registry to prevent modifications?"):
            registry.lock_registry()

@cli.command()
@click.option('--skip-validation', is_flag=True, help='Skip data validation')
def validate(skip_validation):
    """Validate data quality for current week"""
    maya = MayaAnalyticsCLI()
    config = maya.load_config()
    week = maya.auto_detect_week()

    if not skip_validation:
        from beta_analytics_complete import BetaAnalytics
        from supabase import create_client

        click.echo(f"🔍 Validating Week {week} data...")

        # Initialize
        supabase = create_client(config['supabase_url'], config['supabase_key'])
        analyzer = BetaAnalytics(config['supabase_url'], config['supabase_key'])
        validator = DataValidator(supabase)

        # Fetch and validate
        data = analyzer.fetch_week_data(week)
        validation_results = validator.validate_week_data(week, data)

        # Display report
        report = validator.generate_validation_report(validation_results, week)
        click.echo(report)

        # Save report
        validation_path = maya.reports_dir / f'week_{week}_validation.md'
        with open(validation_path, 'w') as f:
            f.write(report)
        click.echo(f"\n📝 Report saved to {validation_path}")

if __name__ == '__main__':
    cli()