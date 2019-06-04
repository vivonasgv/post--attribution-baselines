var margin = ({
    top: 60,
    right: 30,
    bottom: 30,
    left: 30
});

image_size = 300;

indicator_image_size = 75;
indicator_image_padding = 10;
indicator_box_top_padding = 25;

legend_width = 400;
legend_height = 75;
legend_right_padding = 50;
legend_top_padding = 20;

image_padding = 30;
slider_padding = 60;
slider_text_spacing = 100;
chart_padding = 80;
chart_height = 300;
chart_width = 300;
slider_height = 100;

num_images = 3;
width = (num_images + 1) * image_size + (num_images - 1) * image_padding + chart_padding;
height = image_size + slider_height + slider_padding + slider_text_spacing;

slider_width = width - 2 * slider_padding;

var current_samples = 1;
var current_data = null;

var base_image_name = 'goldfinch';
var base_dir = `data_gen/data/${base_image_name}/eg_samples/`;
var interp_im_file = 'interpolated_image_';
var grad_file = 'point_weights_';
var cumulative_file = 'cumulative_weights_';

image_data = [
    { x: 0, y: 0, id: 'display_image', title: 'Test Image'},
    { x: image_size + image_padding, y: 0, id: 'weights_alpha', title: 'Gradients at α'},
    { x: 2 * (image_size + image_padding), y: 0, id: 'cumulative_samples', title: 'Accumulated Gradients up to α'}
];


indicator_data = [
    { x: 0, y: 0, id: 'goldfinch', opacity: 1.0},
    { x: indicator_image_size + indicator_image_padding, y: 0, id: 'rubber_eraser', opacity: 0.2 },
    { x: 2 * (indicator_image_size + indicator_image_padding), y: 0, id: 'house_finch', opacity: 0.2 },
    { x: 3 * (indicator_image_size + indicator_image_padding), y: 0, id: 'killer_whale', opacity: 0.2 }
]

var prev_samples = 0;

var container = d3.select('body')
                    .append('svg')
                    .attr('width',  '100%')
                    .attr('height', '100%')
                    .style('min-width', `${(width + margin.left + margin.right ) / 2}px`)
                    .style('max-width', `${width + margin.left + margin.right}px`)
                    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

var image_group = container
    .append('g')
    .attr('id', 'image_group')
    .attr('width', width)
    .attr('height', image_size)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

image_group
    .selectAll('text')
    .data(image_data)
    .enter()
    .append('text')
    .attr('id', function(d) { return d.id + '_title' })
    .style("text-anchor", "middle")
    .style("font-weight", 700)
    .text(function(d) { return d.title })
    .attr('x', function(d) { return (image_size / 2) + d.x })
    .attr('y', -10);

var indicator_group = container
    .append('g')
    .attr('id', 'indicator_group')
    .attr('width', 4 * indicator_image_size + 3 * indicator_image_padding)
    .attr('height', indicator_image_size + indicator_image_padding + image_padding)
    .attr('transform', `translate(${margin.left + slider_padding}, ${margin.top + image_size + slider_padding + 
        image_padding + slider_height + indicator_box_top_padding})`);

indicator_group
    .append('text')
    .attr('x', indicator_group.attr('width') / 2)
    .attr('y', -indicator_box_top_padding / 2)
    .attr('text-anchor', 'middle')
    .style('font-weight', 700)
    .text('Click to select a different ImageNet image:')
    
var legend_group = container
    .append('g')
    .attr('id', 'legend_group')
    .attr('width', legend_width)
    .attr('height', legend_height)
    .attr('transform', `translate(${margin.left + width - legend_width - legend_right_padding}
        , ${margin.top + image_size + slider_padding + image_padding + slider_height + legend_top_padding})`);  
    
legend_group
    .append('rect')
    .attr('width', legend_width)
    .attr('height', legend_height)
    .attr('fill', 'none')
    .attr('stroke', 'gray')
    .attr('stroke-width', 1.5);

legend_group
    .append('text')
    .attr('x', legend_width * 0.04)
    .attr('y', legend_height * 0.3)
    .style('font-weight', 700)
    .style('font-size', 16)
    .text('Color')

var sum_group = legend_group
    .append('g')
    .attr('width', legend_width * 0.9)
    .attr('height', legend_height * 0.25)
    .attr('transform', `translate(${legend_width * 0.05}, ${legend_height * 0.3})`);

var baseline_group = legend_group
    .append('g')
    .attr('width', legend_width * 0.9)
    .attr('height', legend_height * 0.25)
    .attr('transform', `translate(${legend_width * 0.05}, ${legend_height * 0.6})`);

sum_group.append('rect')
    .attr('y', 12.5)
    .attr('width', 25)
    .attr('height', 5)
    .attr('fill', 'firebrick');

sum_group.append('text')
    .attr('y', 20)
    .attr('x', 35)
    .text('Sum of absolute accumulated gradients at α');
    
baseline_group.append('rect')
    .attr('y', 12.5)
    .attr('width', 25)
    .attr('height', 5)
    .attr('fill', 'darkblue');
    
baseline_group.append('text')
    .attr('y', 20)
    .attr('x', 35)
    .text('Output logit magnitude for the target class');
    
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
    .text("Cumulative Sum of Gradients");
    
line_chart.append("text")             
  .attr("transform", `translate(${(chart_width / 2)}, ${(chart_height + chart_padding / 2)})`)
  .style("text-anchor", "middle")
  .text("Interpolation Constant (α)");

line_chart.append("text")
  .attr("transform", `translate(${(chart_width) / 2}, -10)`)
  .style("text-anchor", "middle")
  .style("font-weight", 700)
  .text("Accumulation of Gradient Magnitudes over α");
      
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

function update_images(current_samples, transition_duration) {

    var interp_file = base_dir + interp_im_file + current_samples + '.png';
    var interp_image = image_group.select('#display_image');
    
    var acc_file = base_dir + cumulative_file + current_samples + '.png';
    var acc_image = image_group.select('#cumulative_samples');
    
    var weights_file = base_dir + grad_file + current_samples + '.png';
    var weights_image = image_group.select('#weights_alpha');
    
    if (transition_duration === 0.0) {
        interp_image.attr('xlink:href', interp_file);
        weights_image.attr('xlink:href', weights_file);
        acc_image.attr('xlink:href', acc_file);
    } else {
        cross_fade_image(interp_image, interp_file, image_group, transition_duration);
        cross_fade_image(weights_image, weights_file, image_group, transition_duration);
        cross_fade_image(acc_image, acc_file, image_group, transition_duration);
    }
}

function draw_chart(data) {
    current_data = data;
    var sample_domain = [0.0, current_samples];
    var sum_domain = d3.extent(data, function(d) { return +d.cumulative_sum; });
    
    cu_data = current_data.filter(function(d) { return filter_method(d, 'IG'); });
    baseline_data = current_data.filter(function(d) { return filter_method(d, 'Target'); });
    
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
        .attr('id', 'grid_markings')    
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
        .y(function(d) { return y(+d.cumulative_sum)});
        
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
        
    chart_markings.selectAll('circle').data(cu_data) 
        .enter()  
        .append('circle')
        .attr('fill', 'firebrick')
        .attr('stroke', 'none')
        .attr('cx', function(d) { return x(Number((+d.sample).toFixed(2))); })
        .attr('cy', function(d) { return y(+d.cumulative_sum); })
        .attr('r', 3);
    
    function update_chart(num_samples, new_data, new_image) {
        var new_cu_data = new_data.filter(function(d) { return filter_method(d, 'IG'); });
        var new_baseline_data = new_data.filter(function(d) { return filter_method(d, 'Target'); });
        
        var transition_duration = 0.0;
        
        if (new_image) {
            transition_duration = 500;
        }
        else if (Math.abs(num_samples - prev_samples) > 10) {
            transition_duration = 50 * Math.abs(num_samples - prev_samples);
        }
        
        var axis_transition = d3
            .transition()
            .duration(transition_duration);
        var mark_transition = d3
            .transition()
            .duration(transition_duration);
                
        var xaxis = line_chart.select('#chart-x-axis');
        var yaxis = line_chart.select('#chart-y-axis');
        
        var sample_domain = [0, num_samples];
        var x = d3.scaleLinear()
            .range([0, image_size])
            .domain(sample_domain);
        
        var sum_domain = d3.extent(current_data, function(d) { return +d.cumulative_sum; });
        var y = d3.scaleLinear()
            .range([image_size, 0])
            .domain(sum_domain);
            
        xaxis.transition(axis_transition).call(d3.axisBottom(x));
        yaxis.transition(axis_transition).call(d3.axisLeft(y))
        
        var x = d3.scaleLinear()
            .range([0, image_size])
            .domain(sample_domain);
        
        var line = d3.line()
            .x(function(d) { return x(+d.sample) })
            .y(function(d) { return y(+d.cumulative_sum)});
        
        chart_markings.select('#line_mark')
            .datum(new_cu_data)
            .transition(mark_transition)
            .attr('d', line);
            
        chart_markings.select('#target_line')
            .datum(new_baseline_data)
            .transition(mark_transition)
            .attr('d', line);
        
        var circle_marks = chart_markings
            .selectAll('circle')
            .data(new_cu_data);
            
        circle_marks
            .exit()
            .transition(mark_transition)
            .attr('cx', function(d) { return x(Number((+d.sample).toFixed(2))); })
            .attr('cy', function(d) { return y(+d.cumulative_sum); })
            .remove();
        
        circle_marks
            .transition(mark_transition)
            .attr('cx', function(d) { return x(Number((+d.sample).toFixed(2))); })
            .attr('cy', function(d) { return y(+d.cumulative_sum); });
            
        circle_marks.enter()
            .append('circle')
            .attr('fill', 'firebrick')
            .attr('stroke', 'none')
            .attr('r', 3)
            .transition(mark_transition)
            .attr('cx', function(d) { return x(Number((+d.sample).toFixed(2))); })
            .attr('cy', function(d) { return y(+d.cumulative_sum); });
                
        prev_samples = num_samples;
    }

    slider_group = container
        .append('g')
        .attr('id', 'slider_group')
        .attr('width', width - 2 * slider_padding)
        .attr('height', slider_height)
        .attr('transform', `translate(${margin.left + slider_padding}, ${margin.top + image_size + slider_padding})`);
    
    slider_group
        .append('rect')
        .attr('fill', 'black')
        .attr('x', 0)
        .attr('y', slider_text_spacing * 0.6 )
        .attr('width', slider_width)
        .attr('height', 3);
        
    slider_group
        .append('rect')
        .attr('fill', 'black')
        .attr('x', 0)
        .attr('y', slider_text_spacing * 0.6 - 10)
        .attr('width', 3)
        .attr('height', 10);
        
    slider_group
        .append('rect')
        .attr('fill', 'black')
        .attr('x', slider_width - 3)
        .attr('y', slider_text_spacing * 0.6 - 10)
        .attr('width', 3)
        .attr('height', 10);
            
    slider_group
        .append('text')
        .attr('id', 'slider_label')
        .style("text-anchor", "middle")
        .style("font-weight", 700)
        .text('# Samples')
        .attr('x', slider_width / 2)
        .attr('y', slider_text_spacing)
        .attr('font-size', 35)
        .attr('fill', 'black')
        .style("font-family", "sans-serif");
    
    var slider = d3
        .sliderHorizontal()
        .min(0)
        .max(50)
        .step(1)
        .ticks(10)
        .width(slider_width)
        .default(0.0)
        .on('onchange', function(sample_value) {
            if (sample_value === 0) {
                sample_value = 1;
            }
            current_samples = sample_value;
            update_images(current_samples, 0);
            update_chart(current_samples, current_data, false);
        });

    slider_group
        .call(slider);
    
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
        update_images(current_samples, 500);
        
        d3.csv(base_dir + 'cumulative_sums.csv').then(function(x) { 
            current_data = x;
            update_chart(current_samples, x, true);
        });
    }
    
    function image_init(image_data) {
        var images = image_group.selectAll('image').data(image_data);
        var indicator_images = indicator_group.selectAll('image').data(indicator_data);
        
        //Main Images
        images.enter()
            .append('image')
            .attr('width', image_size)
            .attr('height', image_size)
            .attr('xlink:href', function(d) {
                if (d.id === 'weights_alpha') {
                    return base_dir + grad_file + current_samples + '.png';
                } else if (d.id == 'cumulative_samples') {
                    return base_dir + cumulative_file + current_samples + '.png';
                } else {
                    return base_dir + interp_im_file + current_samples + '.png';
                }})
            .attr('id', function(d) { return d.id; })
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y; });
        
        //Indicator Images
        indicator_images.enter()
            .append('image')
            .attr('width', indicator_image_size)
            .attr('height', indicator_image_size)
            .attr('xlink:href', function(d) {
                return 'data_gen/data/' + d.id + '/integrated_gradients/interpolated_image_1.0.png';
            })
            .attr('id', function(d) { return d.id; })
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y; })
            .attr('opacity', function(d) { return d.opacity; })
            .on('click', select_new_image);
    }
    
    image_init(image_data);
}

d3.csv(base_dir + 'cumulative_sums.csv').then(function(data) { draw_chart(data) });