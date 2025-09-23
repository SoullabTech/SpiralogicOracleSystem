"""
Delta Visualizer for Week-over-Week Analytics
Creates visual charts and tables for tracking beta progress
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
from pathlib import Path
from typing import Optional, Dict, Any


class DeltaVisualizer:
    """Generate visual delta tracking for week-over-week changes"""

    def __init__(self, colors: Optional[Dict[str, str]] = None):
        # Spiralogic brand colors
        self.colors = colors or {
            "increase": "#4CAF50",     # green for improvements
            "decrease": "#F44336",     # red for declines
            "neutral": "#FFC107",      # amber for no change
            "background": "#1a1a1a",   # dark background
            "grid": "#2a2a2a",        # subtle grid
            "text": "#ffffff"          # white text
        }
        self._setup_style()

    def _setup_style(self):
        """Configure matplotlib style for consistent branding"""
        plt.style.use("dark_background")
        plt.rcParams.update({
            "figure.facecolor": self.colors["background"],
            "axes.facecolor": self.colors["grid"],
            "text.color": self.colors["text"],
            "axes.labelcolor": self.colors["text"],
            "xtick.color": self.colors["text"],
            "ytick.color": self.colors["text"],
            "grid.color": "#3a3a3a",
            "grid.alpha": 0.3,
            "font.size": 10,
            "figure.dpi": 150
        })

    def generate_delta_chart(self, delta_df: pd.DataFrame, output_path: str,
                            week_num: int) -> Optional[str]:
        """Create horizontal bar chart showing week-over-week changes"""

        if delta_df.empty:
            print(f"⚠️ No delta data to visualize for week {week_num}")
            return None

        # Filter to meaningful metrics only
        metrics_to_show = [
            'total_conversations', 'unique_users', 'breakthrough_rate',
            'firewall_triggers', 'avg_coherence', 'retention_rate'
        ]

        plot_data = delta_df[delta_df['metric'].isin(metrics_to_show)].copy()

        if plot_data.empty:
            return None

        # Sort by absolute change for visual impact
        plot_data['abs_change'] = plot_data['absolute_change'].abs()
        plot_data = plot_data.sort_values('absolute_change')

        # Determine colors based on direction
        plot_data['color'] = plot_data['percent_change'].apply(
            lambda x: self.colors["increase"] if x > 0
            else self.colors["decrease"] if x < 0
            else self.colors["neutral"]
        )

        # Create figure
        fig, ax = plt.subplots(figsize=(12, 8))

        # Plot horizontal bars
        bars = ax.barh(
            plot_data['metric'].str.replace('_', ' ').str.title(),
            plot_data['percent_change'],
            color=plot_data['color'],
            edgecolor='white',
            linewidth=0.5,
            alpha=0.9
        )

        # Add value labels on bars
        for bar, (idx, row) in zip(bars, plot_data.iterrows()):
            width = bar.get_width()

            # Position label based on bar direction
            label_x = width + (1 if width >= 0 else -1)
            ha = 'left' if width >= 0 else 'right'

            # Format label with both percentage and absolute value
            if row['metric'] in ['total_conversations', 'unique_users', 'firewall_triggers']:
                label = f"{row['percent_change']:+.1f}% ({row['absolute_change']:+.0f})"
            else:
                label = f"{row['percent_change']:+.1f}%"

            ax.text(
                label_x,
                bar.get_y() + bar.get_height() / 2,
                label,
                va='center',
                ha=ha,
                fontsize=9,
                color=self.colors["text"],
                fontweight='bold'
            )

        # Styling
        ax.set_title(
            f"📊 Week {week_num} vs Week {week_num-1} — Delta Metrics",
            color=self.colors["text"],
            fontsize=14,
            fontweight='bold',
            pad=20
        )

        ax.axvline(0, color=self.colors["text"], linestyle='--', alpha=0.3, linewidth=1)
        ax.set_xlabel("Percentage Change (%)", fontsize=11)
        ax.set_ylabel("Metric", fontsize=11)

        # Add reference lines at key thresholds
        for threshold in [-20, 20]:
            ax.axvline(threshold, color=self.colors["text"], linestyle=':', alpha=0.2)

        # Add grid for easier reading
        ax.grid(True, axis='x', alpha=0.2)
        ax.set_axisbelow(True)

        # Set x-axis limits for consistent scale
        max_change = max(abs(plot_data['percent_change'].max()),
                         abs(plot_data['percent_change'].min()))
        ax.set_xlim(-max_change * 1.3, max_change * 1.3)

        # Save figure
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor=self.colors["background"])
        plt.close(fig)

        print(f"📊 Delta chart saved: {output_path}")
        return output_path

    def generate_delta_table_markdown(self, delta_df: pd.DataFrame, week_num: int) -> str:
        """Generate markdown table of delta metrics for embedding in reports"""

        if delta_df.empty:
            return f"*No delta data available for Week {week_num}*"

        # Format the dataframe for markdown
        table_data = delta_df.copy()

        # Clean up metric names
        table_data['Metric'] = table_data['metric'].str.replace('_', ' ').str.title()

        # Format current and previous values
        table_data['Week ' + str(week_num-1)] = table_data.apply(
            lambda row: f"{row['previous_value']:.0f}"
            if row['metric'] in ['total_conversations', 'unique_users', 'firewall_triggers']
            else f"{row['previous_value']:.2%}"
            if 'rate' in row['metric'] or 'coherence' in row['metric']
            else f"{row['previous_value']:.2f}",
            axis=1
        )

        table_data['Week ' + str(week_num)] = table_data.apply(
            lambda row: f"{row['current_value']:.0f}"
            if row['metric'] in ['total_conversations', 'unique_users', 'firewall_triggers']
            else f"{row['current_value']:.2%}"
            if 'rate' in row['metric'] or 'coherence' in row['metric']
            else f"{row['current_value']:.2f}",
            axis=1
        )

        # Format change with arrow indicators
        table_data['Change'] = table_data.apply(
            lambda row: f"{'↗️' if row['percent_change'] > 0 else '↘️' if row['percent_change'] < 0 else '➡️'} {row['percent_change']:+.1f}%",
            axis=1
        )

        # Select columns for display
        display_df = table_data[['Metric', f'Week {week_num-1}', f'Week {week_num}', 'Change']]

        # Convert to markdown
        markdown_table = "| " + " | ".join(display_df.columns) + " |\n"
        markdown_table += "|" + "---|" * len(display_df.columns) + "\n"

        for _, row in display_df.iterrows():
            markdown_table += "| " + " | ".join(str(val) for val in row.values) + " |\n"

        return markdown_table

    def create_trend_sparklines(self, historical_data: Dict[int, Dict[str, Any]],
                                output_dir: str) -> Dict[str, str]:
        """Generate small sparkline charts for each metric across all weeks"""

        sparklines = {}

        # Convert historical data to DataFrame
        weeks = sorted(historical_data.keys())
        metrics = set()
        for week_data in historical_data.values():
            metrics.update(week_data.keys())

        for metric in metrics:
            values = [historical_data.get(week, {}).get(metric, 0) for week in weeks]

            # Create tiny sparkline
            fig, ax = plt.subplots(figsize=(3, 1))
            ax.plot(weeks, values, color=self.colors["increase"], linewidth=2)
            ax.fill_between(weeks, values, alpha=0.3, color=self.colors["increase"])

            # Remove all axes and labels for clean sparkline
            ax.set_xticks([])
            ax.set_yticks([])
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['bottom'].set_visible(False)
            ax.spines['left'].set_visible(False)

            # Save sparkline
            sparkline_path = os.path.join(output_dir, f"sparkline_{metric}.png")
            plt.savefig(sparkline_path, dpi=100, bbox_inches='tight',
                       transparent=True, pad_inches=0)
            plt.close(fig)

            sparklines[metric] = sparkline_path

        return sparklines