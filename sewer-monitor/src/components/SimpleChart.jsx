import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Simple SVG-based line chart component
 * No external charting library needed
 */
const SimpleChart = ({ data, label, color = '#2196f3', height = 150, yAxisFormatter = (v) => v.toFixed(1) }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = svgRef.current;
    const padding = { top: 10, right: 10, bottom: 30, left: 45 };
    const width = svg.clientWidth;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate min and max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1; // Avoid division by zero

    // Create points for the line
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.value - minValue) / valueRange) * chartHeight;
      return { x, y, value: d.value, label: d.label };
    });

    // Create path string
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Create area fill path
    const areaData = `${pathData} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Draw grid lines
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartHeight;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - padding.right);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#e0e0e0');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      // Y-axis labels
      const value = maxValue - (i / gridLines) * valueRange;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding.left - 5);
      text.setAttribute('y', y + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', '#666');
      text.textContent = yAxisFormatter(value);
      svg.appendChild(text);
    }

    // Draw area fill
    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaData);
    area.setAttribute('fill', color);
    area.setAttribute('fill-opacity', '0.1');
    svg.appendChild(area);

    // Draw line
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2');
    svg.appendChild(path);

    // Draw points
    points.forEach((p, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', color);
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '2');

      // Add tooltip on hover
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${p.label}: ${yAxisFormatter(p.value)}`;
      circle.appendChild(title);

      svg.appendChild(circle);
    });

    // X-axis labels (show only first, middle, and last)
    const labelIndices = [0, Math.floor(data.length / 2), data.length - 1];
    labelIndices.forEach((i) => {
      if (i < points.length) {
        const p = points[i];
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', p.x);
        text.setAttribute('y', height - padding.bottom + 15);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '9');
        text.setAttribute('fill', '#666');
        text.textContent = p.label;
        svg.appendChild(text);
      }
    });

  }, [data, color, height, yAxisFormatter]);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No data to display
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        style={{ display: 'block' }}
      />
    </Box>
  );
};

export default SimpleChart;
