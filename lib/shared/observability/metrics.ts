interface Labels {
  [key: string]: string;
}

interface Counter {
  value: number;
  labels: Labels;
}

interface Histogram {
  buckets: Map<number, number>;
  sum: number;
  count: number;
  labels: Labels;
}

class MetricsAdapter {
  private counters = new Map<string, Counter[]>();
  private histograms = new Map<string, Histogram[]>();
  private defaultBuckets = [0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0];

  incCounter(name: string, labels: Labels = {}): void {
    if (!this.counters.has(name)) {
      this.counters.set(name, []);
    }
    const counters = this.counters.get(name)!;
    const existing = counters.find(c => this.labelsMatch(c.labels, labels));
    if (existing) {
      existing.value++;
    } else {
      counters.push({ value: 1, labels: { ...labels } });
    }
  }

  observe(name: string, value: number, labels: Labels = {}): void {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, []);
    }
    const histograms = this.histograms.get(name)!;
    let existing = histograms.find(h => this.labelsMatch(h.labels, labels));
    if (!existing) {
      existing = {
        buckets: new Map(this.defaultBuckets.map(b => [b, 0])),
        sum: 0,
        count: 0,
        labels: { ...labels }
      };
      histograms.push(existing);
    }
    existing.sum += value;
    existing.count++;
    for (const bucket of this.defaultBuckets) {
      if (value <= bucket) {
        existing.buckets.set(bucket, existing.buckets.get(bucket)! + 1);
      }
    }
  }

  toPrometheus(): string {
    const lines: string[] = [];
    
    // Export counters
    for (const [name, counters] of this.counters) {
      lines.push(`# TYPE ${name} counter`);
      for (const counter of counters) {
        const labelStr = this.formatLabels(counter.labels);
        lines.push(`${name}${labelStr} ${counter.value}`);
      }
    }
    
    // Export histograms
    for (const [name, histograms] of this.histograms) {
      lines.push(`# TYPE ${name} histogram`);
      for (const hist of histograms) {
        const labelStr = this.formatLabels(hist.labels);
        // Buckets
        for (const [bucket, count] of hist.buckets) {
          const bucketLabels = { ...hist.labels, le: bucket.toString() };
          const bucketStr = this.formatLabels(bucketLabels);
          lines.push(`${name}_bucket${bucketStr} ${count}`);
        }
        // +Inf bucket
        const infLabels = { ...hist.labels, le: '+Inf' };
        const infStr = this.formatLabels(infLabels);
        lines.push(`${name}_bucket${infStr} ${hist.count}`);
        // Sum and count
        lines.push(`${name}_sum${labelStr} ${hist.sum}`);
        lines.push(`${name}_count${labelStr} ${hist.count}`);
      }
    }
    
    return lines.join('\n') + '\n';
  }

  private labelsMatch(a: Labels, b: Labels): boolean {
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => a[key] === b[key]);
  }

  private formatLabels(labels: Labels): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return '';
    const labelPairs = entries.map(([k, v]) => `${k}="${v}"`).join(',');
    return `{${labelPairs}}`;
  }
}

export const metrics = new MetricsAdapter();
export const { incCounter, observe, toPrometheus } = metrics;