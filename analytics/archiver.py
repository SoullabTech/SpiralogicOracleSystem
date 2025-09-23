"""
Weekly Archiver with Delta Tracking
Creates comprehensive ZIP archives with week-over-week change analysis
"""

import os
import json
import zipfile
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from .delta_visualizer import DeltaVisualizer


class WeeklyArchiver:
    """Handles creation of comprehensive weekly archives with delta tracking"""

    def __init__(self, obsidian_path: str):
        self.obsidian_path = Path(obsidian_path)
        self.archive_dir = self.obsidian_path / "Archive"
        self.archive_dir.mkdir(exist_ok=True)

    def create_delta_csv(self, week_num: int, current_data: Dict[str, Any],
                        previous_data: Dict[str, Any]) -> pd.DataFrame:
        """Generate CSV with week-over-week deltas for all metrics"""
        delta_records = []

        # Track changes for each metric
        for metric in current_data.keys():
            if metric in previous_data:
                current_val = current_data[metric]
                previous_val = previous_data[metric]

                # Handle numeric comparisons
                if isinstance(current_val, (int, float)) and isinstance(previous_val, (int, float)):
                    abs_change = current_val - previous_val
                    pct_change = ((current_val - previous_val) / previous_val * 100
                                 if previous_val != 0 else 0)
                else:
                    abs_change = None
                    pct_change = None

                delta_records.append({
                    'metric': metric,
                    'week_current': week_num,
                    'week_previous': week_num - 1,
                    'current_value': current_val,
                    'previous_value': previous_val,
                    'absolute_change': abs_change,
                    'percent_change': pct_change
                })

        return pd.DataFrame(delta_records)

    def calculate_data_quality(self, metrics: Dict[str, Any]) -> int:
        """Calculate data quality score for the archive"""
        quality_score = 100

        # Deduct points for missing or low data
        total_convos = metrics.get('total_conversations', 0)
        if total_convos < 50:
            quality_score -= 20
        if total_convos < 20:
            quality_score -= 30
        if not metrics.get('breakthrough_rate'):
            quality_score -= 15
        if not metrics.get('firewall_triggers'):
            quality_score -= 10

        return max(0, quality_score)

    def archive_week(self, week_num: int, metrics_data: Dict[str, Any],
                    previous_metrics: Optional[Dict[str, Any]] = None) -> Path:
        """Create comprehensive ZIP archive for the week with full reproducibility"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        archive_name = self.archive_dir / f"week{week_num}_archive_{timestamp}.zip"

        with zipfile.ZipFile(archive_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add main report
            report_path = self.obsidian_path / f"Week {week_num} Report.md"
            if report_path.exists():
                zipf.write(report_path, f"report/week{week_num}_report.md")

            # Add visualizations
            # Pentagon as main dashboard
            pentagon_path = self.obsidian_path / f"Week {week_num} Pentagon.png"
            if pentagon_path.exists():
                zipf.write(pentagon_path, f"visuals/week{week_num}_dashboard.png")

            # Other visualizations
            for viz_name in ['Heatmap', 'Breakthrough Timeline']:
                viz_path = self.obsidian_path / f"Week {week_num} {viz_name}.png"
                if viz_path.exists():
                    zipf.write(viz_path, f"visuals/week{week_num}_{viz_name.lower().replace(' ', '_')}.png")

            # Add raw data CSVs
            csv_dir = self.obsidian_path / f"Week {week_num} CSVs"
            if csv_dir.exists():
                for csv_file in csv_dir.glob("*.csv"):
                    zipf.write(csv_file, f"data/{csv_file.name}")

            # Generate and add delta tracking if previous data exists
            if previous_metrics:
                delta_df = self.create_delta_csv(week_num, metrics_data, previous_metrics)
                delta_path = f"/tmp/week{week_num}_deltas.csv"
                delta_df.to_csv(delta_path, index=False)
                zipf.write(delta_path, f"deltas/week{week_num}_vs_week{week_num-1}_deltas.csv")
                os.remove(delta_path)

                # Generate delta visualization
                visualizer = DeltaVisualizer()
                chart_path = f"/tmp/week{week_num}_delta_chart.png"
                visualizer.generate_delta_chart(delta_df, chart_path, week_num)
                if os.path.exists(chart_path):
                    # Add to archive
                    zipf.write(chart_path, f"deltas/week{week_num}_delta_chart.png")
                    # Also save to Obsidian vault for embedding
                    vault_chart_path = self.obsidian_path / f"Week {week_num} Delta Chart.png"
                    import shutil
                    shutil.copy2(chart_path, vault_chart_path)
                    os.remove(chart_path)

                # Generate delta table markdown
                self.delta_table_markdown = visualizer.generate_delta_table_markdown(delta_df, week_num)

            # Add metadata file
            data_quality = self.calculate_data_quality(metrics_data)
            metadata = {
                'week': week_num,
                'archived_at': timestamp,
                'archive_version': '1.0',
                'total_conversations': metrics_data.get('total_conversations', 0),
                'breakthrough_rate': metrics_data.get('breakthrough_rate', 0),
                'unique_users': metrics_data.get('unique_users', 0),
                'data_quality_score': data_quality,
                'has_delta_tracking': previous_metrics is not None
            }

            metadata_path = "/tmp/metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            zipf.write(metadata_path, "metadata.json")
            os.remove(metadata_path)

            # Generate README for archive
            readme_content = self._generate_readme(week_num, metrics_data, data_quality, timestamp)
            readme_path = "/tmp/README.md"
            with open(readme_path, 'w') as f:
                f.write(readme_content)
            zipf.write(readme_path, "README.md")
            os.remove(readme_path)

        print(f"📦 Archive created: {archive_name}")
        return archive_name

    def _generate_readme(self, week_num: int, metrics: Dict[str, Any],
                        data_quality: int, timestamp: str) -> str:
        """Generate comprehensive README for the archive"""
        return f"""# Week {week_num} Beta Analytics Archive
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## Archive Contents

### 📁 Structure
- `/report/` - Markdown report with full analysis
- `/visuals/` - Dashboard and visualization exports
- `/data/` - Raw CSV data exports
- `/deltas/` - Week-over-week change tracking
- `metadata.json` - Archive metadata and metrics

## 📊 Key Metrics

| Metric | Value |
|--------|-------|
| Total Conversations | {metrics.get('total_conversations', 0)} |
| Unique Users | {metrics.get('unique_users', 0)} |
| Breakthrough Rate | {metrics.get('breakthrough_rate', 0):.2f}% |
| Data Quality Score | {data_quality}/100 |

## 🔍 Delta Tracking
{f"Contains delta analysis comparing Week {week_num} to Week {week_num-1}" if week_num > 1 else "First week - no deltas available"}

## 📋 Data Files

### Core Metrics
- `breakthroughs.csv` - Breakthrough moment analysis
- `elements.csv` - Elemental pattern distribution
- `firewall.csv` - Spiritual Firewall trigger analysis
- `engagement.csv` - User engagement metrics
- `feedback.csv` - User feedback compilation
- `patterns.csv` - Conversation pattern analysis

### Delta Files (if applicable)
- `week{week_num}_vs_week{week_num-1}_deltas.csv` - Comprehensive change tracking

## 🔄 Usage Instructions

1. **Extract Archive**: Unzip to any location
2. **Review Report**: Start with `/report/week{week_num}_report.md`
3. **Analyze Trends**: Check `/deltas/` for week-over-week changes
4. **Deep Dive**: Use `/data/` CSVs for detailed analysis
5. **Visual Review**: Dashboard in `/visuals/` for quick overview

## ⚡ Data Quality Notes

Quality Score: {data_quality}/100

{"✅ High quality dataset - sufficient data for reliable analysis" if data_quality >= 70 else "⚠️ Limited data - interpret results with caution"}

## 📦 Archive Info
- Version: 1.0
- Created: {timestamp}
- Week Period: Week {week_num} of Beta Testing
- Format: ZIP with DEFLATE compression

---
*MAIA Beta Analytics System - Soullab Development Team*
"""


def load_previous_metrics(week_num: int, obsidian_path: str) -> Optional[Dict[str, Any]]:
    """Load metrics from previous week for delta calculation"""
    prev_report = Path(obsidian_path) / f"Week {week_num} Report.md"

    if not prev_report.exists():
        return None

    # Parse metrics from previous report
    metrics = {}
    with open(prev_report, 'r') as f:
        content = f.read()

        # Extract key metrics using pattern matching
        import re

        # Total conversations
        conv_match = re.search(r'Total Conversations[:\s]+(\d+)', content)
        if conv_match:
            metrics['total_conversations'] = int(conv_match.group(1))

        # Breakthrough rate
        br_match = re.search(r'Breakthrough Rate[:\s]+([\d.]+)%', content)
        if br_match:
            metrics['breakthrough_rate'] = float(br_match.group(1))

        # Unique users
        user_match = re.search(r'Unique Users[:\s]+(\d+)', content)
        if user_match:
            metrics['unique_users'] = int(user_match.group(1))

        # Firewall triggers
        fw_match = re.search(r'Firewall Triggers[:\s]+(\d+)', content)
        if fw_match:
            metrics['firewall_triggers'] = int(fw_match.group(1))

    return metrics if metrics else None