define(function(require) {

var $ = require("jquery");
var Chartist = require("chartist");

var myInternal;
var max;
var min;
var summary_max = 0;
var list;
//
var list_start_at;
var list_stop_at;
var list_duration;
//
var personal_start_at;
var personal_stop_at;
var personal_duration;
//
var personal_list;
var personal_history_timestamp;
var i = 0;
var isRunning = false;
var speed;
var view_current_section = "Coaster Alley";
var history;
var my_section = ["coaster_alley","wet_land","entry_corridor","kiddie_land","tundra_land"];
var my_section_name = ["Coaster Alley","Wet Land","Entry Corridor","Kiddie Land","Tundra Land"];
var strategy = "count_all_communications";
var isChosen = false;
var isChosenID = -1;
$(window).load(function() {
      //getAllGuitars();
});
$(document).ready(function (){
	$(document).on("click","#btn_load",function(){
			clearInterval(myInternal);
			isRunning = false;
			i = 0;
			$("#p_load_status").html("Loading...");
			var start = $("#txt_start").val();
			var end = $("#txt_end").val();
			var offset = $("#txt_offset").val();
			//var strategy = "count_all_communications";
			//var strategy = "count_external_communications";
			$.get("http://"+window.location.hostname+"/visual_final/service/communication.php", {action: "calculate_number_of_communications", start: start, end: end, offset: offset, strategy: strategy},
			function(data){
				//alert(data);
				var responde = JSON.parse(data);
				//alert(data);
				max = responde.max;
				min = responde.min;
				//
				list_start_at = responde.start_at;
				list_stop_at = responde.stop_at;
				list_duration = responde.duration;
				//
				list = responde.list_data;
				$("#p_load_status").html("Done");
				summary_max = responde.summary_max;
				draw_summary_data();
				drawTimeLine();
		});
	});
	$(document).on("click","#btn_detect_personal_data",function(){
			//clearInterval(myInternal);
			//isRunning = false;
			//i = 0;
			$("#p_detect_personl_data").html("Loading...");
			var start = $("#txt_start").val();
			var end = $("#txt_end").val();
			var offset = $("#txt_offset").val();
			var user = $("#txt_user_id").val();
			//var strategy = "count_external_communications";
			$.get("http://"+window.location.hostname+"/visual_final/service/communication.php", {action: "calculate_communications_of_one_user", start: start, end: end, offset: offset, user: user, strategy: strategy},
			function(data){
				//alert(data);
				var responde = JSON.parse(data);
				personal_list = responde.history;
				personal_history_timestamp = responde.history_timestamp;
				//
				personal_start_at = responde.start_at;
				personal_stop_at = responde.stop_at;
				personal_duration = responde.duration;
				//alert(data);
				//max = responde.max;
				//min = responde.min;
				draw_personal_data(responde);
				$("#p_detect_personl_data").html("Done");
				point_current_personal_data(findPostionOfPersonalTimestamp(list[i].timestamp));
				isChosen = true;
				isChosenID = findPostionOfPersonalTimestamp(list[i].timestamp);
		});
	});
	$(document).on("click","#btn_play_controller",function(){
		if(isRunning == false){
			isRunning = true;
			$("#btn_play_controller").val("Pause");
			speed = Math.round((1/$("#txt_speed").val())*1000);
			myInternal= setInterval(function(){
				if(i>=list.length){
					i = 0;
					isRunning = false;
					$("#btn_play_controller").val("Play");
					clearInterval(myInternal);
				}
				else{
					fillSectionByPercentage(list[i], min, max);
					i++;
				}
			},speed);
		}else{
			clearInterval(myInternal);
			isRunning = false;
			$("#btn_play_controller").val("Play");
		}
	});
	$(document).on("click","#btn_back",function(){
		if(i>1){
			i--;
			fillSectionByPercentage(list[i], min, max);
		}
	});
	$(document).on("click","#btn_next",function(){
		if(i<=list.length-1){
			i++;
			fillSectionByPercentage(list[i], min, max);
		}
	});
	$("#txt_speed").change(function() {
	  	var new_speed = $(this).val();
		if($.isNumeric(new_speed) && isRunning == true && new_speed != speed){
			clearInterval(myInternal);
			speed = Math.round((1/new_speed)*1000);
			myInternal= setInterval(function(){
				if(i>=list.length){
					i = 0;
					isRunning = false;
					$("#btn_play_controller").val("Play");
					clearInterval(myInternal);
				}
				else{
					fillSectionByPercentage(list[i], min, max);
					i++;
				}
			},speed);
		}
		//alert(new_speed)
	});
	//------------------------------------------------------------------------------------------------------------------------------
	$( ".section_coaster_alley_under" ).hover(
	  function() {
		  //alert("");
		$(".section_coaster_alley_under").attr("class",$(".section_coaster_alley_under").attr("class")+" section_hover");
	  }, function() {
		$(".section_coaster_alley_under").attr("class",$(".section_coaster_alley_under").attr("class").replace(" section_hover",""));
	  }
	);
	$( ".section_tundra_land_under" ).hover(
	  function() {
		  //alert("");
		$(".section_tundra_land_under").attr("class",$(".section_tundra_land_under").attr("class")+" section_hover");
	  }, function() {
		$(".section_tundra_land_under").attr("class",$(".section_tundra_land_under").attr("class").replace(" section_hover",""));
	  }
	);
	$( ".section_entry_corridor_under" ).hover(
	  function() {
		  //alert("");
		$(".section_entry_corridor_under").attr("class",$(".section_entry_corridor_under").attr("class")+" section_hover");
	  }, function() {
		$(".section_entry_corridor_under").attr("class",$(".section_entry_corridor_under").attr("class").replace(" section_hover",""));
	  }
	);
	$( ".section_kiddie_land_under" ).hover(
	  function() {
		  //alert("");
		$(".section_kiddie_land_under").attr("class",$(".section_kiddie_land_under").attr("class")+" section_hover");
	  }, function() {
		$(".section_kiddie_land_under").attr("class",$(".section_kiddie_land_under").attr("class").replace(" section_hover",""));
	  }
	);
	$( ".section_wet_land_under" ).hover(
	  function() {
		  //alert("");
		$(".section_wet_land_under").attr("class",$(".section_wet_land_under").attr("class")+" section_hover");
	  }, function() {
		$(".section_wet_land_under").attr("class",$(".section_wet_land_under").attr("class").replace(" section_hover",""));
	  }
	);
	//------------------------------------------------------------------------------------------------------------------------------
	$(document).on("click",".section_coaster_alley_under",function(){
		draw_user_communications_chart(list[i],"Coaster Alley");
	});
	$(document).on("click",".section_wet_land_under",function(){
		draw_user_communications_chart(list[i],"Wet Land");
	});
	$(document).on("click",".section_tundra_land_under",function(){
		draw_user_communications_chart(list[i],"Tundra Land");
	});
	$(document).on("click",".section_entry_corridor_under",function(){
		draw_user_communications_chart(list[i],"Entry Corridor");
	});
	$(document).on("click",".section_kiddie_land_under",function(){
		draw_user_communications_chart(list[i],"Kiddie Land");
	});
	drawSotrke();
  $("#p_current_section").html(view_current_section);
	$(document).on("mouseleave","#c_user_location",function(e) {
			//alert("dkm");
			if($("#my_dialog").is(":visible")) $("#my_dialog").hide("fast");
		//$('body').css('cursor', 'none');
	});
	$(document).on("click","input:radio[name=rec_strategy]",function(){
			strategy = $(this).val();
	});
});
function draw_summary_data(data){
	var bar_height = $("#tbl_summary_chart").height();
	var bar_width = $("#tbl_summary_chart").width();
	var each_bar_width = bar_width/(list.length-1);
	var append = '';
	append = append + '<tr class="my_tr_summary">';
	for(var n = 0; n < list.length; n++){
			append = append + '<td alt="0" class = "td_summary_data" id="summary_'+n+'"><div class = "bar_summary" id = "bar_summary_'+n+'"></div></td>"';
	}
	append = append + '</tr>';
	$("#tbl_summary_chart").html(append);
	for(var n = 0; n < list.length; n++){
		var percent = (list[n].summary/summary_max)*100;
		//alert(percent);
			$("#bar_summary_"+n).css("background",getColorByPercentage(percent));
			$("#bar_summary_"+n).css("height",bar_height*percent/100+"px");
	}
	$(".td_summary_data").css("width",each_bar_width+"px");
	$(".td_summary_data").click(function(){
		i = extractID($(this).attr("id"));
		fillSectionByPercentage(list[i], min, max);
	});
}
function draw_personal_data(data){
	console.log(data);
	isChosen = false;
	isChosenID = -1;
	$(".td_personal_data").removeClass("slider_step");
	//alert($(".my_td_header").width());
	//var width =  $("#dv_personal_data_table").width()-103;
	//var width =  $("#dv_personal_data_table").width();
	var append = '';
	var header = '';
	//var td_width = width/data.length;
	var td_height = $("#dv_personal_data_table").height()/my_section.length;
	//alert(data.history[1].detail.length);
	header = header + "<tr>";
	for(var m = 0; m < my_section.length; m++){
		append = append + '<tr class="my_tr_personal">';
		//append = append + '<td class="my_td_header">'+my_section_name[m]+'</td>';
		header = header + '<td class="my_td_header">'+my_section_name[m]+'</td>';
		header = header + "</tr>";
		for(var n = 0; n < data.length; n++){
			append = append + '<td alt="0" class = "td_personal_data" id="'+my_section[m]+"_"+n+'"></td>"';
		}
		append = append + '</tr>';
	}
	//alert(append);
	$("#tbl_personal_data").html(append);
	$("#tbl_personal_data_header").html(header);
	//$(document).find(".td_personal_data").css("width",td_width+"px");
	$(document).find(".td_personal_data").css("height",td_height+"px");

	//$("#slider").slider();

	var current_step = 0;
	var current_location = '';
	var table_width = 0;
	for(var m = 0; m < data.history.length; m++){
		//console.log(data.history[m].detail);
		if(!jQuery.isEmptyObject(data.history[m].detail)){
			for(var n = 0; n < data.history[m].detail.length; n++){
				//append = append + '<td class = "td_personal_data" id="'+my_section[m]+":"+n+'"></td>"';
				if(data.history[m].info.location == "Coaster Alley") current_location = "coaster_alley";
				if(data.history[m].info.location == "Wet Land") current_location = "wet_land";
				if(data.history[m].info.location == "Entry Corridor") current_location = "entry_corridor";
				if(data.history[m].info.location == "Kiddie Land") current_location = "kiddie_land";
				if(data.history[m].info.location == "Tundra Land") current_location = "tundra_land";
				//calculate percentage
				var percent = Math.round((data.history[m].detail[n]["avg"]/data.max)*100);

				//console.log(percent);
				//console.log(data.history[m].detail.length);
				$("#"+current_location+"_"+current_step).css("background",getColorByPercentage(percent));
				$("#"+current_location+"_"+current_step).html('<div class = "dv_link"></div>');
				$("#"+current_location+"_"+current_step).css("width",data.history[m].detail[n]["ratio"]*10+"px");
				$("#"+current_location+"_"+current_step).attr("alt",1);
				$("#"+current_location+"_"+current_step).attr("tag",m+"_"+n+"_"+percent+"_"+getColorByPercentage(percent));
				table_width = table_width + data.history[m].detail[n]["ratio"]*10;
				//alert("#"+current_location+":"+current_step); return;
				current_step++;
			}
		}
	}
	$("#tbl_personal_data").width(table_width+"px");
	$("#tbl_personal_data").css("left","0px");
	$("#tbl_personal_data").css("top","0px");
	$( ".td_personal_data" ).hover(
	  function() {
		  			 $(this).css("cursor","pointer");
		 if(isRunning==false && isChosen==false){
			 var my_id = extractID($(this).attr("id"));
			 point_current_personal_data(my_id);
		 }
	  }, function() {
		  if(isRunning==false && isChosen==false){
			$(".td_personal_data").removeClass("slider_step");
		  }
	  }
	);
	$(".td_personal_data").click(function(){
		if(extractID($(this).attr("id"))==isChosenID){
			isChosenID = -1;
			isChosen = false;
		}else{
			isChosen = true;
			isChosenID=extractID($(this).attr("id"));
			$(".td_personal_data").removeClass("slider_step");
			var my_id = extractID($(this).attr("id"));
			point_current_personal_data(my_id);
		}
	});
	//draw timeline
	drawTimeLine();
}
function drawTimeLine(){
	var parent_width = $("#tbl_summary_chart").width();
	//alert(parent_width);
	var my_duration = (personal_duration/list_duration)*parent_width;
	var my_left = ((personal_start_at-list_start_at)/list_duration)*parent_width;
	$("#dv_personal_timeline").css("width",my_duration+"px");
	$("#dv_personal_timeline").css("margin-left",my_left+"px");
}
function findPostionOfPersonalTimestamp(timestamp){
	//console.log(personal_list.length);
	for(var f_i = 0;f_i<personal_history_timestamp.length;f_i++){
		if(timestamp>=personal_history_timestamp[f_i]){
			if(f_i+1<personal_history_timestamp.length){
				//console.log(personal_history_timestamp[f_i]+":"+timestamp+":"+personal_history_timestamp[f_i+1]);
				if(timestamp<=personal_history_timestamp[f_i+1]) return f_i;
			}else{
				if(f_i+1==personal_history_timestamp.length) return f_i;
			}
		}
		//console.log(personal_list[extract_history].info.um_time);
	}
}
function show_user_location(location, percent, color, json){

	//alert(percent);
	//var my_r = 50;
	//color = "#"+color;
	//if(percent_my_r==0) percent_my_r = 10;
	//alert(percent_my_r);
	//d3.select("#c_user_location").transition().attr("r",percent_my_r);
	//var json = {name: 23234, children: [{name:"ha",size: 6},{name:"song",size: 5}]};

	//console.log(json);

    var diameter = 100 + 80*percent/100,
    format = d3.format(",d");

	var pack = d3.layout.pack()
		.size([diameter, diameter])
		.value(function(d) { return d.size; });
	if ($('#c_user_location').length > 0) {
		//save old position
		var old_x = $("#c_user_location").attr("x");
		var old_y = $("#c_user_location").attr("y");
		//var old_r = $("#c_user_location").attr("r");
		d3.select('#c_user_location').remove();
	d3.select("#svg_map").append("svg")
		.attr("width", diameter)
		.attr("height", diameter)
		.attr("id","c_user_location")
		.attr("x",old_x)
		.attr("y",old_y)
	  	.append("g");
	}else{
	d3.select("#svg_map").append("svg")
		.attr("width", diameter)
		.attr("height", diameter)
		.attr("id","c_user_location")
	  	.append("g");
	}

	  var node = d3.select("#c_user_location").datum(json).selectAll(".node")
		  .data(pack.nodes)
		  .enter().append("g")
		  .attr("class", function(d){
				if(d.children){
					return "node";
				}
				else{
					if(d.name.trim() != "external"){
						if(d.name.trim() != "Sender"){
							return "normal node";
						}else{
							return "null node";
						}
					}else{
						return "external node";
					}
				}
			})
		  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	  //node.append("title").text(function(d) { return d.name + (d.children ? "" : ": " + format(d.size)); });

	  node.append("circle")
	  	.attr("tag",function(d) { return d.name + (d.children ? "" : "_" + format(d.size)); })
	  	.attr("class","my_circle")
		.attr("r", function(d) { return d.r; });

	  node.filter(function(d) { return !d.children; }).append("text")
		  .attr("dy", ".3em")
		  .attr("class", function(d){
					if(d.name.trim() != "external"){
						if(d.name.trim() != "Sender"){
							return "my_title";
						}else{
							return "my_title_external";
						}
					}else{
						return "my_title_external";
					}
			})
		  .style("text-anchor", "middle")
		  .text(function(d) { return d.name.substring(0, d.r / 3); });
		node.append("circle")
			.attr("tag",function(d) { return d.name + (d.children ? "" : "_" + format(d.size)); })
			.attr("class","point")
			.attr("r", function(d) { return d.r; });
				$(".point").mousemove(function(e) {
			//alert(e.pageX );
		if(!$("#my_dialog").is(":visible")) {$("#my_dialog").show("fast"); }
			if(extractPointTag($(this).attr("tag"),"id")!="host"){
				$("#my_dialog_message").html("Reveiver: "+extractPointTag($(this).attr("tag"),"id")+" - Coms: "+extractPointTag($(this).attr("tag"),"com"));
			}else{
				$("#my_dialog_message").html("Sender");
			}
			//d3.select(this).transition().attr("fill","red");
			$("#my_dialog").css("left",e.pageX+20+"px");
			$("#my_dialog").css("top",e.pageY+20+"px");
			//$('body').css('cursor', 'none');
		});
		$(".point").mouseout(function(e) {
			//if($("#my_dialog").is(":visible")) (d3.select(this).transition().attr("fill","red"));
		});
	d3.select(self.frameElement).style("height", diameter + "px");


	var percent_my_r = diameter/2;
	if(location==my_section[0]){
		d3.select("#c_user_location").transition().attr("x",400-percent_my_r).attr("y",682-percent_my_r);
		//d3.select("#c_user_location").transition().
	}
	if(location==my_section[1]){
		d3.select("#c_user_location").transition().attr("x",331-percent_my_r).attr("y",452-percent_my_r);
		//d3.select("#c_user_location").transition().
	}
	if(location==my_section[2]){
		d3.select("#c_user_location").transition().attr("x",491.5-percent_my_r).attr("y",180-percent_my_r);
		//d3.select("#c_user_location").transition().
	}
	if(location==my_section[3]){
		d3.select("#c_user_location").transition().attr("x",690-percent_my_r).attr("y",180-percent_my_r);
		//d3.select("#c_user_location").transition().
	}
	if(location==my_section[4]){
		d3.select("#c_user_location").transition().attr("x",201.5-percent_my_r).attr("y",180-percent_my_r);
		//d3.select("#c_user_location").transition().
	}
}
function extractID(id){
	var id_extract = id.split("_");
	return id_extract[id_extract.length-1];
}
function extractTag(tag,element){
	var extract = tag.split("_");
	if(element == "percent") return extract[2];
	if(element == "color") return extract[3];
	if(element == "history") return extract[0];
	if(element == "detail") return extract[1];
}
function extractPointTag(tag,element){
	var extract = tag.split("_");
	if(element == "id") return extract[0];
	if(element == "com") return extract[1];
}
function drawSotrke(){
	$(".my_area").css("stroke","#212121");
	$(".my_area").css("stroke-width","2");
	$(".my_area").css("stroke-linecap","round");
	//$(".my_area").css("stroke-dasharray","5,10");

}
function point_current_personal_data(step){
	$(".td_personal_data").removeClass("slider_step");
	for(var m = 0; m < my_section.length; m++){
		 $("#"+my_section[m]+"_"+[step]).addClass("slider_step");
		 if($("#"+my_section[m]+"_"+[step]).attr("alt")==1){
			 var extract_history = extractTag($("#"+my_section[m]+"_"+[step]).attr("tag"),"history");
			 var extract_detail = extractTag($("#"+my_section[m]+"_"+[step]).attr("tag"),"detail");
			 var my_json;
			 try{
				if(personal_list[extract_history].detail[extract_detail].children.length>0){
			 		my_json = {name: "host", children:personal_list[extract_history].detail[extract_detail].children};
				}
			 }catch(err){
					my_json = {name: "host", children:[{name:"Sender",size:1}]};
			 }
			 //}
			 //console.log(my_json);
			 show_user_location(my_section[m],extractTag($("#"+my_section[m]+"_"+[step]).attr("tag"),"percent"),extractTag($("#"+my_section[m]+"_"+[step]).attr("tag"),"color"),my_json);
		 }
	}
}
function point_current_summary_data(step){
	$(".td_summary_data").removeClass("summary_step");
	$("#summary_"+step).addClass("summary_step");
}
function draw_user_communications_chart(data, section){
	view_current_section = section;
  $("#p_current_section").html(view_current_section);
	var labels = new Array();
	var series =  new Array();
	series[0] = new Array();
	//labels.push("1");labels.push("2");
	//series[0].push(5); series[0].push(5);
	//series = series.push(series);
  console.log(data);
  console.log(data[section]);
	for (var j=0;j<data.length ;j++){
		series[0].push(data[j].values);
		labels.push(data[j].key);
	}
	var data = {labels:labels,series:series};
	displayLineChart(data);
}
function getGreenToRed(percent){
	var dark = 255;
	r = percent>50 ? 255 : Math.floor((percent*2)*dark/100);
	g = percent<50 ? 255 : Math.floor(dark-(percent*2-100)*dark/100);
	return 'rgb('+r+','+g+',0)';
}
function getColorByPercentage(percent){
	if(percent==0) return "#3d3d3d";
	if(percent>=0 && percent<20) return "#AFB42B";
	if(percent>=20 && percent<40) return "#FBC02D";
	if(percent>=40 && percent<60) return "#FFA000";
	if(percent>=60 && percent<80) return "#E64A19";
	if(percent>=80 && percent<=100) return "#D32F2F";
}

function changeSectionColour(data,p_min,p_max){
	var com = "com: ";
	var per = "per: ";

	var per_coaster_alley = (data["Coaster Alley"].total-p_min)/(p_max-p_min)*100;
	var per_entry_corridor = (data["Entry Corridor"].total-p_min)/(p_max-p_min)*100;
	var per_kiddie_land = (data["Kiddie Land"].total-p_min)/(p_max-p_min)*100;
	var per_tundra_land = (data["Tundra Land"].total-p_min)/(p_max-p_min)*100;
	var per_wet_land = (data["Wet Land"].total-p_min)/(p_max-p_min)*100;

	d3.selectAll(".section_coaster_alley").transition().attr("fill",getGreenToRed(per_coaster_alley));
	d3.select(".section_wet_land").transition().attr("fill",getGreenToRed(per_wet_land));
	d3.selectAll(".section_kiddie_land").transition().attr("fill",getGreenToRed(per_kiddie_land));
	d3.select(".section_entry_corridor").transition().attr("fill",getGreenToRed(per_entry_corridor));
	d3.select(".section_tundra_land").transition().attr("fill",getGreenToRed(per_tundra_land));

	$("#text_tundra_land_com").html(com+data["Tundra Land"].total);
	$("#text_tundra_land_per").html(per+Math.round(per_tundra_land)+"%");

	$("#text_entry_corridor_com").html(com+data["Entry Corridor"].total);
	$("#text_entry_corridor_per").html(per+Math.round(per_entry_corridor)+"%");

	$("#text_kiddie_land_com").html(com+data["Kiddie Land"].total);
	$("#text_kiddie_land_per").html(per+Math.round(per_kiddie_land)+"%");

	$("#text_coaster_alley_com").html(com+data["Coaster Alley"].total);
	$("#text_coaster_alley_per").html(per+Math.round(per_coaster_alley)+"%");

	$("#text_wet_land_com").html(com+data["Wet Land"].total);
	$("#text_wet_land_per").html(per+Math.round(per_wet_land)+"%");
}
function fillSectionByPercentage(data, p_min, p_max){
	console.log(data);

	changeSectionColour(data, p_min,p_max);

	$("#p_from").html(data["from"]);
	$("#p_to").html(data["to"]);

	draw_user_communications_chart(list[i], view_current_section);
	point_current_summary_data(i);
	//console.log(list[i].timestamp);
	try{
		point_current_personal_data(findPostionOfPersonalTimestamp(list[i].timestamp));
		isChosen = true;
		isChosenID = findPostionOfPersonalTimestamp(list[i].timestamp);
	}catch(err){

	}
}
function displayLineChart(data_line_chart){
var data = data_line_chart;
console.log(data);

var options = {
  axisX: {
	  distributeSeries: true,
    labelInterpolationFnc: function(value, index) {
      return value;
    }
  }
};

new Chartist.Bar('#ct-chart', data, options);
}

return {
    draw_user_communications_chart: draw_user_communications_chart
};
});
