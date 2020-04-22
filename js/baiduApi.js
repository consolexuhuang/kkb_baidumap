

var baiduMapController = function(){};
baiduMapController.data = {
    heatmapOverlay : new BMapLib.HeatmapOverlay({"radius":12}),
    markersStoreList :[],         //门店列表
    seaPointList : [],            //对应海量点列表
    
    seaPoint: new Array(),        //初始化海量经纬度列表
    seaMarker: new Array(),       //初始化PointCollection集合

    StorePoint : new Array(),     //门店经纬度表
    StoreCircleList: new Array(), //半径范围表

    overlays :  new Array(),      //绘制覆盖物集合

}
baiduMapController.api = function(){
    return {

    }
}
baiduMapController.init = function(markersStoreList = [],seaPointList = []){
    var selfData = baiduMapController.data
    selfData.markersStoreList = markersStoreList
    selfData.seaPointList = seaPointList
    // console.log(selfData.markersStoreList,selfData.seaPointList)
    if(markersStoreList.length == 1) {
        var centerPoint = new BMap.Point(markersStoreList[0].longitude,markersStoreList[0].latitude);
    } else {
        // var centerPoint = new BMap.Point(121.49, 31.279);
        // console.log(map.getCenter())
        var centerPoint = new BMap.Point(map.getCenter().lng || 121.49, map.getCenter().lat || 31.279);

    }
    // console.log(map.getZoom())
    var geoc = new BMap.Geocoder(); 
    map.centerAndZoom(centerPoint, map.getZoom() || 15);   //中心点坐标，缩放级别
    map.enableScrollWheelZoom(true); //允许拖拽
    map.enableScrollWheelZoom(); // 允许滚轮缩放
    map.addControl(new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_LEFT})) //显示比例尺

    return {
        // 初始化门店覆盖物
        showStoreMarker(){     
            for(let i = 0; i< selfData.markersStoreList.length; i++){
                var s0 = selfData.markersStoreList[i].longitude
                var s1 = selfData.markersStoreList[i].latitude
                // console.log(baiduMapController.methods().qqMapTransBMap(s0,s1))
                selfData.StorePoint[i] = new BMap.Point(baiduMapController.methods().qqMapTransBMap(s0,s1).lng, baiduMapController.methods().qqMapTransBMap(s0,s1).lat)  //生成点
                selfData.StoreCircleList[i] = new BMap.Circle(selfData.StorePoint[i], selfData.markersStoreList[i].circle || 0, {fillColor:"blue", strokeWeight: 1 ,fillOpacity: 0.3, strokeOpacity: 0.3});//设置半径覆盖物的参数，中心坐标，半径，颜色

                //官方覆盖点
                selfData.StorePoint[i] = new BMap.Marker(selfData.StorePoint[i]) //生成标记物
                // selfData.StorePoint[i].setAnimation(BMAP_ANIMATION_BOUNCE); 
                var label = new BMap.Label(selfData.markersStoreList[i].storeName,{offset:new BMap.Size(15,-15)});
                label.setStyle({
                    border:"0",
                    background:"#896eff",
                    color:"#fff",
                    borderRadius:"4px",
                    textAlign:"center",
                    fontSize:'12px',
                    padding:"0 10px",
                    lineHeight:'20px',
                    maxWidth:'300px'
                })
                // console.log('label',label)
                selfData.StorePoint[i].setLabel(label);
                
                //自定义覆盖点
                // var storeMarkerIcon = new BMap.Icon('./pointImg/mendian.png', new BMap.Size(50,50))
                // selfData.StorePoint[i] = new BMap.Marker(selfData.StorePoint[i], {icon: storeMarkerIcon})
                // let label = new BMap.Label(selfData.markersStoreList[i].storeName,{offset:new BMap.Size(25,-10)});
                // label.setStyle({
                //     border:"0",
                //     background:"#896eff",
                //     color:"#fff",
                //     borderRadius:"4px",
                //     textAlign:"center",
                //     fontSize:'12px',
                //     padding:"0 10px",
                //     lineHeight:'20px',
                //     maxWidth:'200px'
                // })
                // selfData.StorePoint[i].setLabel(label);

                //门店事件
                selfData.StorePoint[i].addEventListener("click", baiduMapController.methods().getAttr.bind(selfData.StorePoint[i], i));

                //创建右键菜单
                var StoremarkerMenu = new BMap.ContextMenu();
                StoremarkerMenu.addItem(new BMap.MenuItem(`获取该门店 ${selfData.markersStoreList[i].circle || 0}米 内的用户列表`,baiduMapController.methods().getCricleSeaPointList.bind(selfData.StorePoint[i], selfData.markersStoreList[i].circle), {width: 145}));
                map.addOverlay(selfData.StorePoint[i])
                selfData.StorePoint[i].addContextMenu(StoremarkerMenu);
            }
            // console.log(selfData.StoreCircleList)
        },
        // 初始化海量点
        showSeaMarkerPoint(){
            if (document.createElement('canvas').getContext) {  // 判断当前浏览器是否支持绘制海量点
                for (let i = 0; i < selfData.seaPointList.length; i++) {
                  var a0 = selfData.seaPointList[i].longitude
                  var a1 = selfData.seaPointList[i].latitude
 
                  selfData.seaPoint.push(new BMap.Point(baiduMapController.methods().qqMapTransBMap(a0,a1).lng, baiduMapController.methods().qqMapTransBMap(a0,a1).lat));
                }
                /**
                 * shape : BMAP_POINT_SHAPE_WATERDROP //水滴
                 *         BMAP_POINT_SHAPE_STAR //星星
                 *         BMAP_POINT_SHAPE_CIRCLE //圆
                 */
                var options = {
                    size: BMAP_POINT_SIZE_BIG,
                    shape: BMAP_POINT_SHAPE_WATERDROP,
                    color: '#f99',
                    // memberId:selfData.seaPointList[i].memberId
                }
                selfData.seaMarker = new BMap.PointCollection(selfData.seaPoint, options);  // 初始化PointCollection
                selfData.seaMarker.addEventListener('click', baiduMapController.methods().getOneSEAinfo.bind(selfData.seaMarker,geoc))
                map.addOverlay(selfData.seaMarker);  // 添加Overlay
            } else {
                alert('请在chrome、safari、IE8+以上浏览器查看本示例');
            }
        },
        // 初始化热力图 2:海量
        heatmapInit(type){
            // console.log(selfData.seaPoint)
            // 开启热力图
            if(!baiduMapController.methods().isSupportCanvas()){
               alert('热力图目前只支持有canvas支持的浏览器,您所使用的浏览器不能使用热力图功能~')
            }
            // selfData.heatmapOverlay = new BMapLib.heatmapOverlay({"radius":12});
            map.addOverlay(selfData.heatmapOverlay);
            selfData.heatmapOverlay.setDataSet({data:type == 1 ? selfData.point : selfData.seaPoint , max:3});
            selfData.heatmapOverlay.hide();
            // baiduMapController.methods().setGradient()
        },
        //初始化绘制工具
        drawingManagerInit(){
            var styleOptions = {
                strokeColor:"blue",    //边线颜色。
                fillColor:"blue",      //填充颜色。当参数为空时，圆形将没有填充效果。
                strokeWeight: 2,       //边线的宽度，以像素为单位。
                strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
                fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                strokeStyle: 'solid' //边线的样式，solid或dashed。
            }
            //实例化鼠标绘制工具
            var drawingManager = new BMapLib.DrawingManager(map, {
                isOpen: false, //是否开启绘制模式
                enableDrawingTool: true, //是否显示工具栏
                drawingToolOptions: {
                    anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
                    offset: new BMap.Size(5, 5), //偏离值
                    drawingModes:[BMAP_DRAWING_CIRCLE],
                },
                circleOptions: styleOptions, //圆的样式  BMAP_DRAWING_CIRCLE
                // polylineOptions: styleOptions, //线的样式 BMAP_DRAWING_POLYLINE
                // polygonOptions: styleOptions, //多边形的样式 BMAP_DRAWING_POLYGON
                // rectangleOptions: styleOptions //矩形的样式  BMAP_DRAWING_RECTANGLE
            }); 
            // console.log(drawingManager)
            //添加鼠标绘制工具监听事件，用于获取绘制结果
            drawingManager.addEventListener('overlaycomplete', baiduMapController.methods().overlaycomplete.bind(drawingManager));
            
        }
    }
}
baiduMapController.methods = function(){
    var selfData = baiduMapController.data 
    return {
        // 显示出生地
        openBrthmap(){
            location.reload()
        },
        // 重置海量点
        resetSeaPoint(){
            map.clearOverlays();
			selfData.seaPoint = []
			selfData.seaMarker.clear()
			selfData.StorePoint = []
        },
        // 门店名称显示/隐藏
        hideStoreName(){
            // console.log($(".hideStoreName").val(),selfData.StorePoint)
            if($(".hideStoreName").val() == '隐藏门店名称'){
                for(let i = 0; i<selfData.StorePoint.length; i++){
                    // console.log(selfData.StorePoint[i].z.label)
                    selfData.StorePoint[i].z.label.hide()
                }
                $(".hideStoreName").val("显示门店名称")
            } else {
                for(let i = 0; i<selfData.StorePoint.length; i++){
                    // console.log(selfData.StorePoint[i])

                    selfData.StorePoint[i].z.label.show()
                }
                $(".hideStoreName").val("隐藏门店名称")
            }
        },
        // 显示/隐藏热力图
        Heatmap(){
            // console.log('selfData.seaMarker',selfData.seaMarker)
            if(!selfData.heatmapOverlay.isVisible()){
                baiduMapController.init(markersStoreList,seaPointList).heatmapInit()
                selfData.seaMarker.hide()
                selfData.heatmapOverlay.show();
                $(".Heatmap").val('关闭热力图')
            } else {
                selfData.seaMarker.show()
                selfData.heatmapOverlay.hide();
                $(".Heatmap").val('显示热力图')
            }
        },
        // 获取范围覆盖物列表
        getCricleSeaPointList(radius){
            // console.log('获取该范围用户列表',this.point, radius)
            // let targerpoint = new BMap.Point(targer.lng,targer.lat);
            let seaPointDistance = []
            for(var i = 0; i < selfData.seaPoint.length; i++){
                // console.log(this.point,selfData.seaPoint[i])
                // console.log(map.getDistance(this.point,selfData.seaPoint[i]))
                if(map.getDistance(this.point,selfData.seaPoint[i]) <= radius){
                    // console.log(selfData.seaPointList)
                    seaPointDistance.push(selfData.seaPointList[i].memberId)
                }
                
            }
            alert(`用户id：${seaPointDistance.join(' ,')}`)
        },
        // 绘制门店半径覆盖物
        getAttr(i){
            if(selfData.StoreCircleList[i].isVisible()) {
                selfData.StoreCircleList[i].hide()
            } else {
                map.addOverlay(selfData.StoreCircleList[i]);//在地图上显示圆形覆盖物
                selfData.StoreCircleList[i].show()
                var p = selfData.StorePoint[i].getPosition();       //获取marker的位置
                console.log("marker的位置是" + p.lng + "," + p.lat);   
            }
        },
        // 获取单位海量点信息
        getOneSEAinfo(geoc,e){
            console.log(e)
            var pt = e.point;
            for(let j = 0; j < selfData.seaPointList.length; j++){
                let {lng, lat} = baiduMapController.methods().qqMapTransBMap(selfData.seaPointList[j].longitude,selfData.seaPointList[j].latitude)
                if(selfData.seaPointList[j].longitude && selfData.seaPointList[j].latitude){
                    if(lng == pt.lng && lat == pt.lat){
                        console.log(selfData.seaPointList[j])
                        geoc.getLocation(pt, function(rs){
                            var addComp = rs.addressComponents;
                            alert("用户id : " + selfData.seaPointList[j].memberId + " 。" + addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
                        });  
                    }
                }
            }
        },
        //腾讯转百度 
        qqMapTransBMap(lng,lat){
            let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
            let x = lng;
            let y = lat;
            let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
            let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
            let lngs = z * Math.cos(theta) + 0.0065;
            let lats = z * Math.sin(theta) + 0.006;
            return {
                lng: lngs,
                lat: lats
            }
        },
        // 兼容支持？
        isSupportCanvas(){
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
        },
        // 显示渐变范围
        setGradient(){
            /*格式如下所示:
            {
                0:'rgb(102, 255, 0)',
                .5:'rgb(255, 170, 0)',
                1:'rgb(255, 0, 0)'
            }*/
            var gradient = {
                .2:'#e803eb',
                .4:'#2073aa',
                .6:'#e803eb',
                .8:'#2073aa',
                1:'rgb(255, 0, 0)'
            };
            var colors = document.querySelectorAll("input[type='color']");
            colors = [].slice.call(colors,0);
            colors.forEach(function(ele){
                gradient[ele.getAttribute("data-key")] = ele.value; 
            });
            selfData.heatmapOverlay.setOptions({"gradient":gradient});
        },
        // 获取鼠标绘制区域范围内的海量点
        overlaycomplete(e){
            // console.log(e)
            selfData.overlays.push(e.overlay);
            if (e.drawingMode == BMAP_DRAWING_CIRCLE) {
                console.log('半径：' + e.overlay.getRadius(), "中心点：" + e.overlay.getCenter().lng , e.overlay.getCenter().lat)
                let pointCenter = e.overlay.getCenter()
                let seaPointDistance = []
                for(var k = 0; k < selfData.seaPoint.length; k++){
                    // console.log(pointCenter,selfData.seaPoint[k])
                    // console.log(map.getDistance(pointCenter, selfData.seaPoint[k]))
                    if(map.getDistance(pointCenter, selfData.seaPoint[k]) <= e.overlay.getRadius()){
                        // console.log()
                        // seaPointDistance += selfData.seaPointList[i].memberId
                        seaPointDistance.push(selfData.seaPointList[k].memberId)
                    }
                    
                }
                // alert(`用户id：${seaPointDistance.join(' ,')}`)
                alert(`半径在${e.overlay.getRadius()}米，用户数：${seaPointDistance.length}`)
            } 
        },
        // 清除所有绘制覆盖物
        clearOverlays(){
            // console.log(overlays)
            for(var i = 0; i < selfData.overlays.length; i++){
                map.removeOverlay(selfData.overlays[i]);
            }
            selfData.overlays.length = 0
        },
    }
}
