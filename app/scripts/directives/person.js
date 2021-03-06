angular.module('topazApp')
  .directive('person', function() {
    var ki = "#Kirill"
    return {
      restrict: 'E',
      templateUrl: "views/directive-person.html",
      scope: {
        id: '@'
      },
      link: function(scope, element) {

        var graphElem = element[0].querySelector('.graph');

        var rngString = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

        graphElem.id = rngString;
        scope.graphId = graphElem.id;


        var RadarChart = {
          defaultConfig: {
            containerClass: 'radar-chart',
            w: 600,
            h: 600,
            factor: 0.95,
            factorLegend: 1,
            levels: 3,
            maxValue: 0,
            radians: 2 * Math.PI,
            color: d3.scale.category10(),
            axisLine: true,
            axisText: true,
            circles: true,
            radius: 5,
            axisJoin: function(d, i) {
              return d.className || i;
            },
            transitionDuration: 300
          },
          chart: function() {
            // default config
            var cfg = Object.create(RadarChart.defaultConfig);

            function radar(selection) {
              selection.each(function(data) {
                var container = d3.select(this);

                // allow simple notation
                data = data.map(function(datum) {
                  if (datum instanceof Array) {
                    datum = {
                      axes: datum
                    };
                  }
                  return datum;
                });

                var maxValue = Math.max(cfg.maxValue, d3.max(data, function(d) {
                  return d3.max(d.axes, function(o) {
                    return o.value;
                  });
                }));

                var allAxis = data[0].axes.map(function(i, j) {
                  return i.axis;
                });
                var total = allAxis.length;
                var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);

                container.classed(cfg.containerClass, 1);

                function getPosition(i, range, factor, func) {
                  factor = typeof factor !== 'undefined' ? factor : 1;
                  return range * (1 - factor * func(i * cfg.radians / total));
                }

                function getHorizontalPosition(i, range, factor) {
                  return getPosition(i, range, factor, Math.sin);
                }

                function getVerticalPosition(i, range, factor) {
                  return getPosition(i, range, factor, Math.cos);
                }

                // levels && axises
                var levelFactors = d3.range(0, cfg.levels).map(function(level) {
                  return radius * ((level + 1) / cfg.levels);
                });

                var levelGroups = container.selectAll('g.level-group').data(levelFactors);

                levelGroups.enter().append('g');
                levelGroups.exit().remove();

                levelGroups.attr('class', function(d, i) {
                  return 'level-group level-group-' + i;
                });

                var levelLine = levelGroups.selectAll('.level').data(function(levelFactor) {
                  return d3.range(0, total).map(function() {
                    return levelFactor;
                  });
                });

                levelLine.enter().append('line');
                levelLine.exit().remove();

                levelLine
                  .attr('class', 'level')
                  .attr('x1', function(levelFactor, i) {
                    return getHorizontalPosition(i, levelFactor);
                  })
                  .attr('y1', function(levelFactor, i) {
                    return getVerticalPosition(i, levelFactor);
                  })
                  .attr('x2', function(levelFactor, i) {
                    return getHorizontalPosition(i + 1, levelFactor);
                  })
                  .attr('y2', function(levelFactor, i) {
                    return getVerticalPosition(i + 1, levelFactor);
                  })
                  .attr('transform', function(levelFactor) {
                    return 'translate(' + (cfg.w / 2 - levelFactor) + ', ' + (cfg.h / 2 - levelFactor) + ')';
                  });

                if (cfg.axisLine || cfg.axisText) {
                  var axis = container.selectAll('.axis').data(allAxis);

                  var newAxis = axis.enter().append('g');
                  if (cfg.axisLine) {
                    newAxis.append('line');
                  }
                  if (cfg.axisText) {
                    newAxis.append('text');
                  }

                  axis.exit().remove();

                  axis.attr('class', 'axis');

                  if (cfg.axisLine) {
                    axis.select('line')
                      .attr('x1', cfg.w / 2)
                      .attr('y1', cfg.h / 2)
                      .attr('x2', function(d, i) {
                        return getHorizontalPosition(i, cfg.w / 2, cfg.factor);
                      })
                      .attr('y2', function(d, i) {
                        return getVerticalPosition(i, cfg.h / 2, cfg.factor);
                      });
                  }

                  if (cfg.axisText) {
                    axis.select('text')
                      .attr('class', function(d, i) {
                        var p = getHorizontalPosition(i, 0.5);

                        return 'legend ' +
                          ((p < 0.4) ? 'left' : ((p > 0.6) ? 'right' : 'middle'));
                      })
                      .attr('dy', function(d, i) {
                        var p = getVerticalPosition(i, 0.5);
                        return ((p < 0.1) ? '1em' : ((p > 0.9) ? '0' : '0.5em'));
                      })
                      .text(function(d) {
                        return d;
                      })
                      .attr('x', function(d, i) {
                        return getHorizontalPosition(i, cfg.w / 2, cfg.factorLegend);
                      })
                      .attr('y', function(d, i) {
                        return getVerticalPosition(i, cfg.h / 2, cfg.factorLegend);
                      });
                  }
                }

                // content
                data.forEach(function(d) {
                  d.axes.forEach(function(axis, i) {
                    axis.x = getHorizontalPosition(i, cfg.w / 2, (parseFloat(Math.max(axis.value, 0)) / maxValue) * cfg.factor);
                    axis.y = getVerticalPosition(i, cfg.h / 2, (parseFloat(Math.max(axis.value, 0)) / maxValue) * cfg.factor);
                  });
                });

                var polygon = container.selectAll(".area").data(data, cfg.axisJoin);

                polygon.enter().append('polygon')
                  .classed({
                    area: 1,
                    'd3-enter': 1
                  })
                  .on('mouseover', function(d) {
                    container.classed('focus', 1);
                    d3.select(this).classed('focused', 1);
                  })
                  .on('mouseout', function() {
                    container.classed('focus', 0);
                    d3.select(this).classed('focused', 0);
                  });

                polygon.exit()
                  .classed('d3-exit', 1) // trigger css transition
                  .transition().duration(cfg.transitionDuration)
                  .remove();

                polygon
                  .each(function(d, i) {
                    var classed = {
                      'd3-exit': 0
                    }; // if exiting element is being reused
                    classed['radar-chart-serie' + i] = 1;
                    if (d.className) {
                      classed[d.className] = 1;
                    }
                    d3.select(this).classed(classed);
                  })
                  // styles should only be transitioned with css
                  .style('stroke', function(d, i) {
                    return cfg.color(i);
                  })
                  .style('fill', function(d, i) {
                    return cfg.color(i);
                  })
                  .transition().duration(cfg.transitionDuration)
                  // svg attrs with js
                  .attr('points', function(d) {
                    return d.axes.map(function(p) {
                      return [p.x, p.y].join(',');
                    }).join(' ');
                  })
                  .each('start', function() {
                    d3.select(this).classed('d3-enter', 0); // trigger css transition
                  });

                if (cfg.circles && cfg.radius) {
                  var tooltip = container.selectAll('.tooltip').data([1]);
                  tooltip.enter().append('text').attr('class', 'tooltip');

                  var circleGroups = container.selectAll('g.circle-group').data(data, cfg.axisJoin);

                  circleGroups.enter().append('g').classed({
                    'circle-group': 1,
                    'd3-enter': 1
                  });
                  circleGroups.exit()
                    .classed('d3-exit', 1) // trigger css transition
                    .transition().duration(cfg.transitionDuration).remove();

                  circleGroups
                    .each(function(d) {
                      var classed = {
                        'd3-exit': 0
                      }; // if exiting element is being reused
                      if (d.className) {
                        classed[d.className] = 1;
                      }
                      d3.select(this).classed(classed);
                    })
                    .transition().duration(cfg.transitionDuration)
                    .each('start', function() {
                      d3.select(this).classed('d3-enter', 0); // trigger css transition
                    });

                  var circle = circleGroups.selectAll('.circle').data(function(datum, i) {
                    return datum.axes.map(function(d) {
                      return [d, i];
                    });
                  });

                  circle.enter().append('circle')
                    .classed({
                      circle: 1,
                      'd3-enter': 1
                    })
                    .on('mouseover', function(d) {
                      tooltip
                        .attr('x', d[0].x - 10)
                        .attr('y', d[0].y - 5)
                        .text(d[0].value)
                        .classed('visible', 1);

                      container.classed('focus', 1);
                      container.select('.area.radar-chart-serie' + d[1]).classed('focused', 1);
                    })
                    .on('mouseout', function(d) {
                      tooltip.classed('visible', 0);

                      container.classed('focus', 0);
                      container.select('.area.radar-chart-serie' + d[1]).classed('focused', 0);
                    });

                  circle.exit()
                    .classed('d3-exit', 1) // trigger css transition
                    .transition().duration(cfg.transitionDuration).remove();

                  circle
                    .each(function(d) {
                      var classed = {
                        'd3-exit': 0
                      }; // if exit element reused
                      classed['radar-chart-serie' + d[1]] = 1;
                      d3.select(this).classed(classed);
                    })
                    // styles should only be transitioned with css
                    .style('fill', function(d) {
                      return cfg.color(d[1]);
                    })
                    .transition().duration(cfg.transitionDuration)
                    // svg attrs with js
                    .attr('r', cfg.radius)
                    .attr('cx', function(d) {
                      return d[0].x;
                    })
                    .attr('cy', function(d) {
                      return d[0].y;
                    })
                    .each('start', function() {
                      d3.select(this).classed('d3-enter', 0); // trigger css transition
                    });

                  // ensure tooltip is upmost layer
                  var tooltipEl = tooltip.node();
                  tooltipEl.parentNode.appendChild(tooltipEl);
                }
              });
            }

            radar.config = function(value) {
              if (!arguments.length) {
                return cfg;
              }
              if (arguments.length > 1) {
                cfg[arguments[0]] = arguments[1];
              } else {
                d3.entries(value || {}).forEach(function(option) {
                  cfg[option.key] = option.value;
                });
              }
              return radar;
            };

            return radar;
          },
          draw: function(id, d, options) {
            var chart = RadarChart.chart().config(options);
            var cfg = chart.config();

            d3.select(id).select('svg').remove();
            d3.select(id)
              .append("svg")
              .attr("width", cfg.w)
              .attr("height", cfg.h)
              .datum(d)
              .call(chart);
          }
        };

        //////////////////////////////////////

        var bluemixData = {
          "id": "*UNKNOWN*",
          "source": "*UNKNOWN*",
          "word_count": 919,
          "word_count_message": "There were 919 words in the text, we recommend text with at least 100 (and preferably 2,000)words ",
          "processed_lang": "en",
          "tree": {
            "id": "r",
            "name": "root",
            "children": [{
              "id": "personality",
              "name": "Big 5 ",
              "children": [{
                "id": "Openness_parent",
                "name": "Openness",
                "category": "personality",
                "percentage": 0.8661216384165396,
                "children": [{
                  "id": "Openness",
                  "name": "Openness",
                  "category": "personality",
                  "percentage": 0.8661216384165396,
                  "sampling_error": 0.0595161799,
                  "children": [{
                    "id": "Adventurousness",
                    "name": "Adventurousness",
                    "category": "personality",
                    "percentage": 0.6480806160810039,
                    "sampling_error": 0.0506098397,
                    "raw_score": -0.06434167573449401,
                    "raw_sampling_error": 0.004965433
                  }, {
                    "id": "Artistic interests",
                    "name": "Artistic interests",
                    "category": "personality",
                    "percentage": 0.1720812246317844,
                    "sampling_error": 0.10316170570000001,
                    "raw_score": 0.007954298150163219,
                    "raw_sampling_error": 0.0025264184999999996
                  }, {
                    "id": "Emotionality",
                    "name": "Emotionality",
                    "category": "personality",
                    "percentage": 0.20894405813537634,
                    "sampling_error": 0.047318306399999996,
                    "raw_score": 0.04834602829162132,
                    "raw_sampling_error": 0.0053576219
                  }, {
                    "id": "Imagination",
                    "name": "Imagination",
                    "category": "personality",
                    "percentage": 0.890360200130527,
                    "sampling_error": 0.0635484612,
                    "raw_score": -0.03816104461371055,
                    "raw_sampling_error": 0.0036305959000000002
                  }, {
                    "id": "Intellect",
                    "name": "Intellect",
                    "category": "personality",
                    "percentage": 0.8977214249357705,
                    "sampling_error": 0.0554422481,
                    "raw_score": -0.03785636561479869,
                    "raw_sampling_error": 0.006190882900000001
                  }, {
                    "id": "Liberalism",
                    "name": "Authority-challenging",
                    "category": "personality",
                    "percentage": 0.8637710062490557,
                    "sampling_error": 0.0828878357,
                    "raw_score": -0.0563220892274211,
                    "raw_sampling_error": 0.006919308
                  }],
                  "raw_score": -0.06515778019586507,
                  "raw_sampling_error": 0.0017246609000000001
                }, {
                  "id": "Conscientiousness",
                  "name": "Conscientiousness",
                  "category": "personality",
                  "percentage": 0.4439503917371812,
                  "sampling_error": 0.0751709558,
                  "children": [{
                    "id": "Achievement striving",
                    "name": "Achievement striving",
                    "category": "personality",
                    "percentage": 0.4456380407732615,
                    "sampling_error": 0.0976920975,
                    "raw_score": -0.015103373231773666,
                    "raw_sampling_error": 0.0024664739
                  }, {
                    "id": "Cautiousness",
                    "name": "Cautiousness",
                    "category": "personality",
                    "percentage": 0.7135566961335971,
                    "sampling_error": 0.0909483512,
                    "raw_score": 0.004298150163220891,
                    "raw_sampling_error": 0.0012487053
                  }, {
                    "id": "Dutifulness",
                    "name": "Dutifulness",
                    "category": "personality",
                    "percentage": 0.10706341001594759,
                    "sampling_error": 0.0596093614,
                    "raw_score": 0.011262241566920565,
                    "raw_sampling_error": 0.003443773
                  }, {
                    "id": "Orderliness",
                    "name": "Orderliness",
                    "category": "personality",
                    "percentage": 0.2611910859220759,
                    "sampling_error": 0.06960432679999999,
                    "raw_score": 0.01162132752992383,
                    "raw_sampling_error": 0.0024187696
                  }, {
                    "id": "Self-discipline",
                    "name": "Self-discipline",
                    "category": "personality",
                    "percentage": 0.11627342180637147,
                    "sampling_error": 0.0466752655,
                    "raw_score": -0.01736670293797606,
                    "raw_sampling_error": 0.0027231549
                  }, {
                    "id": "Self-efficacy",
                    "name": "Self-efficacy",
                    "category": "personality",
                    "percentage": 0.5109805574298945,
                    "sampling_error": 0.0915522316,
                    "raw_score": 0.014885745375408052,
                    "raw_sampling_error": 0.0020673184
                  }],
                  "raw_score": -0.014657236126224158,
                  "raw_sampling_error": 0.0012948933
                }, {
                  "id": "Extraversion",
                  "name": "Extraversion",
                  "category": "personality",
                  "percentage": 0.3575823088359155,
                  "sampling_error": 0.0561552225,
                  "children": [{
                    "id": "Activity level",
                    "name": "Activity level",
                    "category": "personality",
                    "percentage": 0.02354756928413456,
                    "sampling_error": 0.0769954828,
                    "raw_score": 0.010065288356909684,
                    "raw_sampling_error": 0.0023609595000000003
                  }, {
                    "id": "Assertiveness",
                    "name": "Assertiveness",
                    "category": "personality",
                    "percentage": 0.8486984108031435,
                    "sampling_error": 0.0824749536,
                    "raw_score": 0.013579978237214366,
                    "raw_sampling_error": 0.0021620984
                  }, {
                    "id": "Cheerfulness",
                    "name": "Cheerfulness",
                    "category": "personality",
                    "percentage": 0.12185660869989938,
                    "sampling_error": 0.103738125,
                    "raw_score": 0.0657671381936888,
                    "raw_sampling_error": 0.0017607574
                  }, {
                    "id": "Excitement-seeking",
                    "name": "Excitement-seeking",
                    "category": "personality",
                    "percentage": 0.11391736691420798,
                    "sampling_error": 0.0805592736,
                    "raw_score": 0.005897714907508164,
                    "raw_sampling_error": 0.0025220087
                  }, {
                    "id": "Friendliness",
                    "name": "Outgoing",
                    "category": "personality",
                    "percentage": 0.09906569729437953,
                    "sampling_error": 0.0744443346,
                    "raw_score": 0.04854189336235039,
                    "raw_sampling_error": 0.0061035869
                  }, {
                    "id": "Gregariousness",
                    "name": "Gregariousness",
                    "category": "personality",
                    "percentage": 0.07298256984296865,
                    "sampling_error": 0.057434397400000003,
                    "raw_score": 0.03570184983677911,
                    "raw_sampling_error": 0.0035287729
                  }],
                  "raw_score": 0.03630032644178455,
                  "raw_sampling_error": 0.0013001063
                }, {
                  "id": "Agreeableness",
                  "name": "Agreeableness",
                  "category": "personality",
                  "percentage": 0.20593829129717198,
                  "sampling_error": 0.09578529329999999,
                  "children": [{
                    "id": "Altruism",
                    "name": "Altruism",
                    "category": "personality",
                    "percentage": 0.08545002765840208,
                    "sampling_error": 0.06984325899999999,
                    "raw_score": 0.023471164309031557,
                    "raw_sampling_error": 0.0023046431
                  }, {
                    "id": "Cooperation",
                    "name": "Cooperation",
                    "category": "personality",
                    "percentage": 0.3946024967726951,
                    "sampling_error": 0.0792394125,
                    "raw_score": 0.03149075081610447,
                    "raw_sampling_error": 0.0052093663000000005
                  }, {
                    "id": "Modesty",
                    "name": "Modesty",
                    "category": "personality",
                    "percentage": 0.0457168411495443,
                    "sampling_error": 0.0552900821,
                    "raw_score": 0.01131664853101197,
                    "raw_sampling_error": 0.0022148311
                  }, {
                    "id": "Morality",
                    "name": "Uncompromising",
                    "category": "personality",
                    "percentage": 0.12151913870363097,
                    "sampling_error": 0.062314912900000005,
                    "raw_score": 0.03482045701849837,
                    "raw_sampling_error": 0.0064646556999999995
                  }, {
                    "id": "Sympathy",
                    "name": "Sympathy",
                    "category": "personality",
                    "percentage": 0.9308325115825007,
                    "sampling_error": 0.0965643573,
                    "raw_score": 0.022274211099020672,
                    "raw_sampling_error": 0.0024097256
                  }, {
                    "id": "Trust",
                    "name": "Trust",
                    "category": "personality",
                    "percentage": 0.12765287559138616,
                    "sampling_error": 0.0549400709,
                    "raw_score": 0.030696409140369967,
                    "raw_sampling_error": 0.003555043
                  }],
                  "raw_score": 0.06295973884657237,
                  "raw_sampling_error": 0.0040096358
                }, {
                  "id": "Neuroticism",
                  "name": "Emotional range",
                  "category": "personality",
                  "percentage": 0.3520083771560689,
                  "sampling_error": 0.0899635058,
                  "children": [{
                    "id": "Anger",
                    "name": "Fiery",
                    "category": "personality",
                    "percentage": 0.4400562906417668,
                    "sampling_error": 0.0930496886,
                    "raw_score": 0.02390642002176279,
                    "raw_sampling_error": 0.0045647662
                  }, {
                    "id": "Anxiety",
                    "name": "Prone to worry",
                    "category": "personality",
                    "percentage": 0.19088534923248668,
                    "sampling_error": 0.0544775348,
                    "raw_score": 0.0037323177366702953,
                    "raw_sampling_error": 0.0022036192
                  }, {
                    "id": "Depression",
                    "name": "Melancholy",
                    "category": "personality",
                    "percentage": 0.4998515811812315,
                    "sampling_error": 0.0580159869,
                    "raw_score": 0.00174102285092492,
                    "raw_sampling_error": 0.0021267767999999998
                  }, {
                    "id": "Immoderation",
                    "name": "Immoderation",
                    "category": "personality",
                    "percentage": 0.27010995382321096,
                    "sampling_error": 0.052025688800000004,
                    "raw_score": 0.0002829162132753,
                    "raw_sampling_error": 0.0024543245
                  }, {
                    "id": "Self-consciousness",
                    "name": "Self-consciousness",
                    "category": "personality",
                    "percentage": 0.3007305798055868,
                    "sampling_error": 0.0558133514,
                    "raw_score": 0.012437431991294884,
                    "raw_sampling_error": 0.0012633915
                  }, {
                    "id": "Vulnerability",
                    "name": "Susceptible to stress",
                    "category": "personality",
                    "percentage": 0.2064860278174838,
                    "sampling_error": 0.08456727259999999,
                    "raw_score": 0.003090315560391731,
                    "raw_sampling_error": 0.00312098
                  }],
                  "raw_score": 0.009357997823721438,
                  "raw_sampling_error": 0.004029144399999999
                }]
              }]
            }, {
              "id": "needs",
              "name": "Needs",
              "children": [{
                "id": "Self-expression_parent",
                "name": "Self-expression",
                "category": "needs",
                "percentage": 0.009168713720219593,
                "children": [{
                  "id": "Challenge",
                  "name": "Challenge",
                  "category": "needs",
                  "percentage": 0.21420616426449027,
                  "sampling_error": 0.0825770599,
                  "raw_score": -0.004677449238302507,
                  "raw_sampling_error": 0.018905023
                }, {
                  "id": "Closeness",
                  "name": "Closeness",
                  "category": "needs",
                  "percentage": 0.07164326223109568,
                  "sampling_error": 0.0814755665,
                  "raw_score": 0.047765709707290556,
                  "raw_sampling_error": 0.0067801364
                }, {
                  "id": "Curiosity",
                  "name": "Curiosity",
                  "category": "needs",
                  "percentage": 0.02418905343875527,
                  "sampling_error": 0.1174626862,
                  "raw_score": -0.03434990900979324,
                  "raw_sampling_error": 0.0085328844
                }, {
                  "id": "Excitement",
                  "name": "Excitement",
                  "category": "needs",
                  "percentage": 0.021562334377806962,
                  "sampling_error": 0.1069825972,
                  "raw_score": 0.05569080945048967,
                  "raw_sampling_error": 0.009352985500000001
                }, {
                  "id": "Harmony",
                  "name": "Harmony",
                  "category": "needs",
                  "percentage": 0.4244255627108314,
                  "sampling_error": 0.1067790979,
                  "raw_score": -0.1921737475048966,
                  "raw_sampling_error": 0.0087322964
                }, {
                  "id": "Ideal",
                  "name": "Ideal",
                  "category": "needs",
                  "percentage": 0.009844093545259823,
                  "sampling_error": 0.0966733897,
                  "raw_score": 0.09683314825897715,
                  "raw_sampling_error": 0.0093355313
                }, {
                  "id": "Liberty",
                  "name": "Liberty",
                  "category": "needs",
                  "percentage": 0.07019988520089304,
                  "sampling_error": 0.1429808733,
                  "raw_score": -0.0807364917410228,
                  "raw_sampling_error": 0.0023652419
                }, {
                  "id": "Love",
                  "name": "Love",
                  "category": "needs",
                  "percentage": 0.3236577877088745,
                  "sampling_error": 0.09837867310000001,
                  "raw_score": -0.38406664691294884,
                  "raw_sampling_error": 0.0047612676
                }, {
                  "id": "Practicality",
                  "name": "Practicality",
                  "category": "needs",
                  "percentage": 0.43702146032781636,
                  "sampling_error": 0.08508378009999999,
                  "raw_score": -0.1700478956343852,
                  "raw_sampling_error": 0.0123273818
                }, {
                  "id": "Self-expression",
                  "name": "Self-expression",
                  "category": "needs",
                  "percentage": 0.009168713720219593,
                  "sampling_error": 0.0798047469,
                  "raw_score": -0.00629977317845485,
                  "raw_sampling_error": 0.0098576651
                }, {
                  "id": "Stability",
                  "name": "Stability",
                  "category": "needs",
                  "percentage": 0.015300165838061857,
                  "sampling_error": 0.10406753660000001,
                  "raw_score": 0.003358880003264412,
                  "raw_sampling_error": 0.0074949988
                }, {
                  "id": "Structure",
                  "name": "Structure",
                  "category": "needs",
                  "percentage": 0.009992979108210603,
                  "sampling_error": 0.0779964543,
                  "raw_score": 0.003728478316648554,
                  "raw_sampling_error": 0.0123056712
                }]
              }]
            }, {
              "id": "values",
              "name": "Values",
              "children": [{
                "id": "Conservation_parent",
                "name": "Conservation",
                "category": "values",
                "percentage": 0.03790050048775773,
                "children": [{
                  "id": "Conservation",
                  "name": "Conservation",
                  "category": "values",
                  "percentage": 0.03790050048775773,
                  "sampling_error": 0.0667570254,
                  "raw_score": -0.005240623257889009,
                  "raw_sampling_error": 0.0017599407999999998
                }, {
                  "id": "Openness to change",
                  "name": "Openness to change",
                  "category": "values",
                  "percentage": 0.8010947697413803,
                  "sampling_error": 0.06355850390000001,
                  "raw_score": 0.006901220243743198,
                  "raw_sampling_error": 0.0014879386999999999
                }, {
                  "id": "Hedonism",
                  "name": "Hedonism",
                  "category": "values",
                  "percentage": 0.6336456214821301,
                  "sampling_error": 0.1354438982,
                  "raw_score": 0.0066786308705114265,
                  "raw_sampling_error": 0.0015083026
                }, {
                  "id": "Self-enhancement",
                  "name": "Self-enhancement",
                  "category": "values",
                  "percentage": 0.8192217389582772,
                  "sampling_error": 0.1012875023,
                  "raw_score": 0.0004927210642002184,
                  "raw_sampling_error": 0.0012780188
                }, {
                  "id": "Self-transcendence",
                  "name": "Self-transcendence",
                  "category": "values",
                  "percentage": 0.5012630258188537,
                  "sampling_error": 0.0787735593,
                  "raw_score": 0.0010740819608269859,
                  "raw_sampling_error": 0.0028270723
                }]
              }]
            }]
          }
        }

        // Structures the IBM JSON into a format which the charting library uses.
        var fiveBigPersonalities = []
        for (i = 0; i < 5; i++) {
          fiveBigPersonalities.push(bluemixData.tree.children[0].children[0].children[i])
        }

        RadarChart.defaultConfig.color = function() {};
        RadarChart.defaultConfig.radius = 0;
        RadarChart.defaultConfig.w = 100;
        RadarChart.defaultConfig.h = 100;
        RadarChart.defaultConfig.maxValue = 1;
        RadarChart.defaultConfig.axisText = false;

        // This part is pretty hacking. Will change it soon. 
        function randomDataset(fiveBigPersonalities) {
          var arrayData = [{
            "className": "germany",
            "axes": []
          }]
          var arrayPushed = []
          fiveBigPersonalities.forEach(function(d, i) {
            arrayPushed.push({
              'axis': d.name,
              'value': d.percentage
            })
          })
          arrayData[0].axes = arrayPushed
          return arrayData
        };


        var chart = RadarChart.chart();
        var cfg = chart.config(); // retrieve default config

        // Put the ID name here.
        var kiri = "#Kirill"
        console.log(graphElem.id)
        var svg = d3.select("#" + graphElem.id)
          .attr('width', cfg.w + cfg.w + 50)
          .attr('height', cfg.h + cfg.h / 4);

        // svg.append('g').datum(randomDataset()).call(chart);


      },

      controller: ['$scope', 'SalsaService', function($scope, SalsaService) {


        $scope.close = $scope.close || false;

        $scope.index = "Kirill";
        $scope.name = "Kirill";

        function updateChart(run) {
          console.log(run)
        }

        $scope.pictureUrl = "https://scontent-lax1-1.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/1607113_491012347714488_7875067251027324117_n.jpg?oh=28d7fd64ad76d919a75ee7a2994892f8&oe=564D2002";

        console.log("before getPerson " + $scope.id);
        SalsaService.getPerson($scope.id).success(function(data) {
          console.log("in getPerson " + data);
          updateChart(data);
        })
        .error(function (error) {
          console.log("in error " + error);
        });


      }]
    };
  });