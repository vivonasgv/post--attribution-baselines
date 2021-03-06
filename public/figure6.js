function figure6() {
    var margin = ({
        top: 30,
        right: 30,
        bottom: 30,
        left: 30
    });

    var image_size = 300;
    var reference_image_size = 200;

    var indicator_image_size = 75;
    var indicator_image_padding = 10;
    var indicator_box_top_padding = 25;

    var legend_width = 400;
    var legend_height = 75;
    var legend_right_padding = 50;
    var legend_top_padding = 20;

    var image_padding = 30;
    var slider_padding = 30;
    var slider_image_padding = 60;
    var slider_text_spacing = 40;
    var chart_padding = 80;
    var chart_height = 300;
    var chart_width = 300;

    var slider_height = 40;
    var slider_image_size = 26;
    var slider_image_col_count = 50;
    var slider_num_images = 50;
    var slider_image_row_count = Math.ceil(slider_num_images / slider_image_col_count);
    var slider_image_left_padding = -10;

    var num_images = 3;
    var width = (num_images + 1) * image_size + (num_images - 1) * image_padding + chart_padding;
    var height = image_size + slider_height + 
        slider_padding + slider_image_padding + slider_text_spacing + 
        slider_image_row_count * slider_image_size + 
        indicator_box_top_padding + indicator_image_padding + indicator_image_size;

    var slider_width = width - 2 * slider_padding;

    var current_samples = 10;
    var current_data = null;

    var base_image_name = 'goldfinch';
    var base_dir = `data_gen/data/${base_image_name}/eg_samples/`;
    var interp_im_file = 'interpolated_image_';
    var grad_file = 'point_weights_';
    var cumulative_file = 'cumulative_weights_';

    var title_data = [
        { x: 0, y: 0, id: 'display_image', title: '(1): Interpolated Image'},
        { x: image_size + image_padding, y: 0, id: 'weights_alpha', title: '(2): Gradients at Interpolation'},
        { x: 2 * (image_size + image_padding), y: 0, id: 'cumulative_samples', title: '(3): Cumulative Gradients'}
    ];
    
    var image_data = [];
    for (var j = 0; j <= 50; ++j) {
        var samples = j * 10;
        image_data.push(
            { x: 0, y: 0, id: 'interpolated_image_', samples: samples }
        );
        image_data.push(
            { x: image_size + image_padding, y: 0, id: 'point_weights_', samples: samples }
        );
        image_data.push(
            { x: 2*(image_size + image_padding), y: 0, id: 'cumulative_weights_', samples: samples }
        );
    }

    var indicator_data = [
        { x: 0, y: 0, id: 'goldfinch', opacity: 1.0},
        { x: indicator_image_size + indicator_image_padding, y: 0, id: 'rubber_eraser', opacity: 0.2 },
        { x: 2 * (indicator_image_size + indicator_image_padding), y: 0, id: 'house_finch', opacity: 0.2 },
        { x: 3 * (indicator_image_size + indicator_image_padding), y: 0, id: 'killer_whale', opacity: 0.2 }
    ];

    slider_data = [];
    for (var i = 0; i < slider_num_images; ++i) {
        slider_data.push({
            rank: i * 10,
            x: (i % slider_image_col_count) * slider_image_size,
            y: Math.floor(i / slider_image_col_count)  * slider_image_size,
            id: `slider_im_${i * 10}`,
            url_end: `reference_${(i + 1) * 10}.png`,
            opacity: (i === 0 ? 1.0 : 0.0)
        });
    }

    var prev_samples = 0;

    var container = d3.select('#figure6_div')
                        .append('svg')
                        .attr('width',  '100%')
                        .attr('height', '100%')
                        .style('min-width', `${(width + margin.left + margin.right ) / 2}px`)
                        // .style('max-width', `${width + margin.left + margin.right}px`)
                        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    var image_group = container
        .append('g')
        .attr('id', 'image_group')
        .attr('width', width)
        .attr('height', image_size)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    image_group
        .selectAll('text')
        .data(title_data)
        .enter()
        .append('text')
        .attr('id', function(d) { return d.id + '_title' })
        .style("text-anchor", "middle")
        .style("font-weight", 700)
        .text(function(d) { return d.title })
        .attr('x', function(d) { return (image_size / 2) + d.x })
        .attr('y', -10)
        .style('font-size', '22px');

    var indicator_group = container
        .append('g')
        .attr('id', 'indicator_group')
        .attr('width', 4 * indicator_image_size + 3 * indicator_image_padding)
        .attr('height', indicator_image_size + indicator_image_padding + image_padding)
        .attr('transform', `translate(${margin.left + slider_padding}, 
            ${margin.top + image_size + slider_padding + 
            slider_image_row_count * slider_image_size + slider_image_padding +
            image_padding + slider_height + indicator_box_top_padding})`);

    indicator_group
        .append('text')
        .attr('x', indicator_group.attr('width') / 2)
        .attr('y', -indicator_box_top_padding / 2)
        .attr('text-anchor', 'middle')
        .style('font-weight', 700)
        .style('font-size', '18px')
        .text('Click to select a different image:')
        
    var line_chart = image_group
        .append('g')
        .attr('id', 'line_chart')
        .attr('width', chart_width)
        .attr('height', chart_height)
        .attr('transform', `translate(${num_images * image_size + (num_images - 1) * image_padding + chart_padding}, 0)`);

    line_chart.append('text')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chart_padding / 2 - 10)
        .attr("x", 0 - chart_height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Mean Cumulative Sum of Gradients");
        
    line_chart.append("text")             
      .attr("transform", `translate(${(chart_width / 2)}, ${(chart_height + chart_padding / 2)})`)
      .style("text-anchor", "middle")
      .text("Number of Samples");

    line_chart.append("text")
      .attr("transform", `translate(${(chart_width) / 2}, -10)`)
      .style("text-anchor", "middle")
      .style("font-weight", 700)
      .style('font-size', '22px')
      .text("(4): Sum of Cumulative Grads");
          
    var chart_svg_border = image_group
        .append('g')
        .attr('id', 'chart_svg_border')
        .attr('transform', `translate(${num_images * image_size + (num_images - 1) * image_padding + chart_padding - 5}, -5)`)
        .append('svg')
        .attr('width', chart_width + 10)
        .attr('height', chart_height + 10);

    var chart_markings = chart_svg_border
        .append('g')
        .attr('id', 'chart_markings')
        .attr('transform', `translate(5, 5)`)

    container.selectAll('text').style("font-family", "sans-serif");

    function filter_method(row, method) {
        return row.method == method;
    }

    function samples_less(row, samples) {
        return +Number((+row.samples).toFixed(2)) <= samples;
    }

    function handle_mouseover(d, i) {
        if (d.rank > current_samples) { 
            return;
        }
        var x_pos = d.x + slider_image_size + 5;
        if (d.rank > 25) {
            x_pos = d.x - slider_image_size - 5 - reference_image_size;
        }
        var base_image = slider_image_group.select('#' + d.id);
        var tooltip_image = slider_image_group.append('image')
            .attr('x', x_pos)
            .attr('y', d.y + slider_image_size + 5)
            .attr('width', reference_image_size)
            .attr('height', reference_image_size)
            .attr('xlink:href', 'data_gen/data/house_finch/eg_samples/' + d.url_end)
            .attr('id', d.id + '_tooltip')
            .attr('z-index', 1);
            
            base_image.on('mousemove', function() { handle_mousemove(tooltip_image, base_image, d.x, d.y, d.rank) });
    }

    function handle_mouseout(d, i) {
        var tooltip_image = slider_image_group.select('#' + d.id + '_tooltip');
        tooltip_image.remove();
    }

    function handle_mousemove(image, enter_svg, orig_x, orig_y, rank) {
        var coordinates = d3.mouse(enter_svg.node());
        var x = coordinates[0] - enter_svg.attr('x');
        var y = coordinates[1] - enter_svg.attr('y');
        
        var x_pos = orig_x + slider_image_size + 5 + x;
        if (rank > 250) {
            x_pos = orig_x - slider_image_size - 5 - reference_image_size + x;
        }
        image.attr('x', x_pos)
             .attr('y', orig_y + slider_image_size + 5 + y);
    }
    
    function update_images(samples, change_links) {
        if (samples == current_samples && !change_links) {
            return;
        }
        
        if (change_links) {
            setTimeout(function() {
                for (var j = 0; j <= 50; ++j) {
                    var interpolated_image = image_group
                        .select('#interpolated_image_' + j * 10);
                    var point_weight_image = image_group
                        .select('#point_weights_' + j * 10);
                    var cumulative_weight_image = image_group
                        .select('#cumulative_weights_' + j * 10);
                        
                    var interpolated_image_file = base_dir + 'interpolated_image_' + j * 10 + '.png';
                    var point_weight_image_file = base_dir + 'point_weights_' + j * 10 + '.png';
                    var cumulative_weight_image_file = base_dir + 'cumulative_weights_' + j * 10 + '.png';
                    
                    interpolated_image.attr('xlink:href', interpolated_image_file);
                    point_weight_image.attr('xlink:href', point_weight_image_file);
                    cumulative_weight_image.attr('xlink:href', cumulative_weight_image_file);
                    
                }
            }, 500);
            
            var interpolated_image = image_group
                .select('#interpolated_image_' + samples);
            var point_weight_image = image_group
                .select('#point_weights_' + samples);
            var cumulative_weight_image = image_group
                .select('#cumulative_weights_' + samples);
                
            var interpolated_image_file = base_dir + 'interpolated_image_' + samples + '.png';
            var point_weight_image_file = base_dir + 'point_weights_' + samples + '.png';
            var cumulative_weight_image_file = base_dir + 'cumulative_weights_' + samples + '.png';
            cross_fade_image(interpolated_image, interpolated_image_file, image_group, 500);
            cross_fade_image(point_weight_image, point_weight_image_file, image_group, 500);
            cross_fade_image(cumulative_weight_image, cumulative_weight_image_file, image_group,
                 500); 
        } else {
            image_group
                .select('#interpolated_image_' + current_samples)
                .attr('opacity', 0.0);
            image_group
                .select('#point_weights_' + current_samples)
                .attr('opacity', 0.0);
            image_group
                .select('#cumulative_weights_' + current_samples)
                .attr('opacity', 0.0);
            
            image_group
                .select('#interpolated_image_' + samples)
                .attr('opacity', 1.0);
            image_group
                .select('#point_weights_' + samples)
                .attr('opacity', 1.0);
            image_group
                .select('#cumulative_weights_' + samples)
                .attr('opacity', 1.0);
        }
        var slider_images = slider_image_group.selectAll('image');
        slider_images.attr('opacity', function(d) {
            return (d.rank < samples ? 1.0 : 0.0)
        });
    }

    function draw_chart(data) {
        current_data = data;
        var sample_domain = [0.0, Math.max(current_samples, 0)];
        var sum_domain = d3.extent(data, function(d) { return +d.cumulative_sum; });
        
        var cu_data = current_data.filter(function(d) { return filter_method(d, 'IG'); });
        var baseline_data = current_data.filter(function(d) { return filter_method(d, 'Target'); });
        
        var x = d3.scaleLinear()
            .range([0, image_size])
            .domain(sample_domain);
            
        var y = d3.scaleLinear()
            .range([image_size, 0])
            .domain(sum_domain);
            
        var xaxis = line_chart.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${image_size})`)
            .attr('id', 'chart-x-axis')
            .call(d3.axisBottom(x));
        
        var yaxis = line_chart.append('g')
            .attr('class', 'axis axis--y')
            .attr('id', 'chart-y-axis')
            .call(d3.axisLeft(y));
            
        line_chart.append('g')
            .attr('id', 'grid_markings_6')    
            .selectAll('line.horizontalGrid').data(y.ticks()).enter()
            .append('line')
            .attr('class', 'horizontalGrid')
            .attr('x1', 0)
            .attr('x2', image_size)
            .attr('y1', function(d) { return y(d) + 0.5; })
            .attr('y2', function(d) { return y(d) + 0.5; })
            .attr('shape-rendering', 'crispEdges')
            .attr('fill', 'none')
            .attr('stroke', 'gray')
            .attr('stroke-width', '1px');
            
        // line_chart.selectAll('line.verticalGrid').data(x.ticks()).enter()
        //     .append('line')
        //     .attr('class', 'verticalGrid')
        //     .attr('y1', 0)
        //     .attr('y2', image_size)
        //     .attr('x1', function(d) { return x(d) + 0.5; })
        //     .attr('x2', function(d) { return x(d) + 0.5; })
        //     .attr('shape-rendering', 'crispEdges')
        //     .attr('fill', 'none')
        //     .attr('stroke', 'gray')
        //     .attr('stroke-width', '1px');
        
        var line = d3.line()
            .x(function(d) { return x(+d.sample) })
            .y(function(d) { return y(+d.cumulative_sum)})
            .curve(d3.curveMonotoneX);
            
        var line1 = d3.line()
            .x(function(d) { return x(+d.sample) })
            .y(function(d) { return y(+d.cumulative_sum)});
        
        chart_markings.append('path')
            .datum(cu_data)
            .attr('id', 'line_mark')
            .attr('class', 'line')
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', 'firebrick')
            .attr('stroke-width', 2);

        chart_markings.append('path')
            .datum(baseline_data)
            .attr('id', 'target_line')
            .attr('class', 'line')
            .attr('d', line1)
            .attr('fill', 'none')
            .attr('stroke', 'darkblue')
            .attr('stroke-width', 2);
            
        // chart_markings.selectAll('circle').data(cu_data) 
        //     .enter()  
        //     .append('circle')
        //     .attr('fill', 'firebrick')
        //     .attr('stroke', 'none')
        //     .attr('cx', function(d) { return x(Number((+d.sample).toFixed(2))); })
        //     .attr('cy', function(d) { return y(+d.cumulative_sum); })
        //     .attr('r', 3);
        
        function update_chart(num_samples, new_data, new_image) {
            var new_cu_data = new_data.filter(function(d) { return filter_method(d, 'IG'); });
            var new_baseline_data = new_data.filter(function(d) { return filter_method(d, 'Target'); });
            
            var transition_duration = 0.0;
            
            if (new_image) {
                transition_duration = 500;
            }
            else if (Math.abs(num_samples - prev_samples) > 10) {
                transition_duration = 1 * Math.abs(num_samples - prev_samples);
            }
            
            var axis_transition = d3
                .transition()
                .duration(transition_duration);
            var mark_transition = d3
                .transition()
                .duration(transition_duration);
                    
            var xaxis = line_chart.select('#chart-x-axis');
            var yaxis = line_chart.select('#chart-y-axis');
            
            var sample_domain = [0, Math.max(current_samples, 0)];
            var x = d3.scaleLinear()
                .range([0, image_size])
                .domain(sample_domain);
            
            var sum_domain = d3.extent(current_data, function(d) { return +d.cumulative_sum; });
            var y = d3.scaleLinear()
                .range([image_size, 0])
                .domain(sum_domain);
            
            if (new_image) {
                var grid_markings_data = d3.select('#grid_markings_6')
                    .selectAll('line.horizontalGrid')
                    .data(y.ticks());
                
                grid_markings_data.exit()
                    .transition(axis_transition)
                    .attr('y1', 0.0)
                    .attr('y2', 0.0)
                    .style('stroke-opacity', 0)
                    .remove();
                
                grid_markings_data.transition(axis_transition)
                    .attr('y1', function(d) { return y(d) + 0.5; })
                    .attr('y2', function(d) { return y(d) + 0.5; });
                
                grid_markings_data.enter()
                .append('line')
                .attr('class', 'horizontalGrid')
                .attr('x1', 0)
                .attr('x2', image_size)
                .attr('y1', 0.0)
                .attr('y2', 0.0)
                .attr('shape-rendering', 'crispEdges')
                .attr('fill', 'none')
                .attr('stroke', 'gray')
                .attr('stroke-width', '1px')
                .transition(axis_transition)
                .attr('y1', function(d) { return y(d) + 0.5; })
                .attr('y2', function(d) { return y(d) + 0.5; });
            }
                
            xaxis.transition(axis_transition).call(d3.axisBottom(x));
            yaxis.transition(axis_transition).call(d3.axisLeft(y))
            
            var x = d3.scaleLinear()
                .range([0, image_size])
                .domain(sample_domain);
            
            var line = d3.line()
                .x(function(d) { return x(+d.sample) })
                .y(function(d) { return y(+d.cumulative_sum)})
                .curve(d3.curveMonotoneX);
            
            chart_markings.select('#line_mark')
                .datum(new_cu_data)
                .transition(mark_transition)
                .attr('d', line);
                
            chart_markings.select('#target_line')
                .datum(new_baseline_data)
                .transition(mark_transition)
                .attr('d', line);
            
            // var circle_marks = chart_markings
            //     .selectAll('circle')
            //     .data(new_cu_data);
            // 
            // circle_marks
            //     .exit()
            //     .transition(mark_transition)
            //     .attr('cx', function(d) { return x(Number((+d.sample).toFixed(2))); })
            //     .attr('cy', function(d) { return y(+d.cumulative_sum); })
            //     .remove();
            // 
            // circle_marks
            //     .transition(mark_transition)
            //     .attr('cx', function(d) { return x(Number((+d.sample).toFixed(2))); })
            //     .attr('cy', function(d) { return y(+d.cumulative_sum); });
            // 
            // circle_marks.enter()
            //     .append('circle')
            //     .attr('fill', 'firebrick')
            //     .attr('stroke', 'none')
            //     .attr('r', 3)
            //     .transition(mark_transition)
            //     .attr('cx', function(d) { return x(Number((+d.sample).toFixed(2))); })
            //     .attr('cy', function(d) { return y(+d.cumulative_sum); });
                    
            prev_samples = num_samples;
        }
        
        slider_group = container
            .append('g')
            .attr('id', 'slider_group')
            .attr('width', width - 2 * slider_padding)
            .attr('height', slider_height)
            .attr('transform', `translate(${margin.left + slider_padding}, 
                ${margin.top + image_size + slider_padding + 
                    + slider_image_padding + slider_image_size * slider_image_row_count})`);
                
        var slider_label = slider_group
            .append('text')
            .attr('id', 'slider_label')
            .style("text-anchor", "middle")
            .style("font-weight", 700)
            .text(`${current_samples} samples`)
            .attr('x', slider_width / 2)
            .attr('y', slider_text_spacing)
            .attr('font-size', 20)
            .attr('fill', 'black')
            .style("font-family", "sans-serif");
        
        var ticks = [
            {'pos': 0, 'label': 1},
            {'pos': 10, 'label': 100},
            {'pos': 20, 'label': 200},
            {'pos': 30, 'label': 300},
            {'pos': 40, 'label': 400},
            {'pos': 50, 'label': 500},
        ]
        var slider2 = slid3r()
            .width(width - 2 * slider_padding)
            .range([1, 50])
            .startPos(1)
            .clamp(true)
            .label(null)
            // .numTicks(6)
            .customTicks(ticks)
            .font('sans-serif')
            .onDrag(function(sample_value) {
                update_images(Math.round(sample_value) * 10, false);
                update_chart(Math.round(sample_value) * 10, current_data, false);
                
                sample_value = Math.round(sample_value);
                current_samples = sample_value * 10;
                slider_label.text(`${current_samples} samples`);
            });

        slider_group.append('g')
            .call(slider2);
            
        slider_image_group = container
            .append('g')
            .attr('id', 'slider_image_group')
            .attr('width', slider_image_size * slider_image_col_count)
            .attr('height', slider_image_size * slider_image_row_count)
            .attr('transform', `translate(${margin.left + slider_padding + slider_image_left_padding},
                ${margin.top + image_size + slider_image_padding})`);
        slider_image_group
            .append('text')
            .attr('id', 'slider_image_label')
            .text('Reference Images:')
            .attr('x', 0)
            .attr('y', -10)
            .attr('font-size', '18px')
            .attr('fill', 'black')
            .style("font-family", "sans-serif");
        
        function select_new_image(row, i) {
            if (base_image_name === row.id) {
                return;
            }
            
            var indicator_images = indicator_group.selectAll('image').data(indicator_data)
            indicator_images.attr('opacity', function(d) {
                if (row.id == d.id) {
                    return 1.0;
                } else {
                    return 0.2
                }
            })
            
            base_image_name = row.id;
            base_dir = `data_gen/data/${base_image_name}/eg_samples/`;
            update_images(current_samples, true);
            
            d3.csv(base_dir + 'cumulative_sums.csv').then(function(x) { 
                current_data = x;
                update_chart(current_samples, x, true);
            });
        }
        
        function image_init(image_data) {
            var images = image_group.selectAll('image').data(image_data);
            var indicator_images = indicator_group.selectAll('image').data(indicator_data);
            var slider_images = slider_image_group.selectAll('image').data(slider_data);
            
            //Main Images
            images.enter()
                .append('image')
                .attr('width', image_size)
                .attr('height', image_size)
                .attr('xlink:href', function(d) {
                    return base_dir + d.id + d.samples + '.png';
                    })
                .attr('id', function(d) { 
                    return d.id + d.samples; 
                    })
                .attr('x', function(d) { return d.x; })
                .attr('y', function(d) { return d.y; })
                .attr('opacity', function(d) {
                    if (d.samples == current_samples) {
                        return 1.0;
                    } else {
                        return 0.0;
                    }
                });
            
            //Indicator Images
            indicator_images.enter()
                .append('image')
                .attr('width', indicator_image_size)
                .attr('height', indicator_image_size)
                .attr('xlink:href', function(d) {
                    return 'data_gen/data/' + d.id + '/integrated_gradients/interpolated_image_1.00.png';
                })
                .attr('id', function(d) { return d.id; })
                .attr('x', function(d) { return d.x; })
                .attr('y', function(d) { return d.y; })
                .attr('opacity', function(d) { return d.opacity; })
                .on('click', select_new_image);
            
            slider_images.enter()
                .append('image')
                .attr('width', slider_image_size)
                .attr('height', slider_image_size)
                .attr('xlink:href', function(d) {
                    return 'data_gen/data/house_finch/eg_samples/' + d.url_end;
                })
                .attr('id', function(d) { return d.id; })
                .attr('x', function(d) { return d.x; })
                .attr('y', function(d) { return d.y; })
                .attr('opacity', function(d) { return d.opacity; })
                .on('mouseover', handle_mouseover)
                .on('mouseout', handle_mouseout);
        }
        
        image_init(image_data);
    }

    d3.csv(base_dir + 'cumulative_sums.csv').then(function(data) { draw_chart(data) });
}

figure6();