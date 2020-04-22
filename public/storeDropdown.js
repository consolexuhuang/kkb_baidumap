    //DropdownSearch 构造
	function DropdownSearch(dropdown,currentDateId = ''){
		// console.log('currentDateId',currentDateId)
		this.dropdown = dropdown;
		this.currentDateId = currentDateId
		this.setDom()
		var _this = this;
		$(document).off('click',''+_this.dropdown+' .dropdown-menu a').on('click',''+_this.dropdown+' .dropdown-menu a',function(e){
            _this.select(e);
		})
		$(document).on('keyup',''+_this.dropdown+' .dropdown-menu .seach_name',function(e){
            _this.search(e);
		})
	}
    //选择方法
	DropdownSearch.prototype.select = function(e){
		// console.log($(e.target).parent()[0].id)
		var currentStoreId = $(e.target).parent()[0].id
		var _text = $(e.target).text(),   
		parent = $(e.target).closest(this.dropdown); 
        $(parent).find("button em").html(_text);
		console.log('当前选择的门店---',_text)

		// map.clearOverlays();
		// baiduMapController.data.seaPoint = []
		// baiduMapController.data.seaMarker.clear()
		// // console.log(baiduMapController.data.StorePoint)
		// baiduMapController.data.StorePoint = []

		baiduMapController.methods().resetSeaPoint()
		console.log('this.currentDateId',this.currentDateId)
		if(this.currentDateId){
			loadScript(`./js/mapLinkSurface/${this.currentDateId}_StoreLinkOrder/seaSelection.js`, function(){
				//markersStoreList, seaPointList   
				// console.log(seaPointList_Json)
				$(".Heatmap").val('显示热力图')
				$(".hideStoreName").val("隐藏门店名称")
				markersStoreList = []
				seaPointList = []
				for(let k = 0; k < storeSelectionList.length; k++){
					if(currentStoreId== storeSelectionList[k].storeId ){
						markersStoreList.push(storeSelectionList[k])
					}
				}
				for(let i = 0; i < seaPointList_Json.length; i++){
				if(currentStoreId == seaPointList_Json[i].storeId){
					seaPointList.push(seaPointList_Json[i])
				}
				}
				// console.log(markersStoreList,seaPointList)
				baiduMapController.init(markersStoreList,seaPointList).showStoreMarker()
				baiduMapController.init(markersStoreList,seaPointList).showSeaMarkerPoint()
			})
		}
	 }

    //搜索方法
	DropdownSearch.prototype.search = function(e){
	 	var value = $(e.target).val().trim();
	 	if(value.length < 1){
	 		$(''+this.dropdown+' li:not(":first")').show(); 
	 	}else{
	 		$(''+this.dropdown+' li:not(":first")').hide(); 
	 		$(this.dropdown).find("li:not(':first')[data*='"+value+"']").show(); 
	 	}
	}
	//创建子节点
	DropdownSearch.prototype.setDom = function(){
		loadScript(`./js/mapLinkSurface/${this.currentDateId}_StoreLinkOrder/storeSelection.js`, function(){
			for(var i = 0; i < storeSelectionList.length; i++){
				var $Li=$(`
				   <li data = "${storeSelectionList[i].storeName}" id = "${storeSelectionList[i].storeId}"><a>${storeSelectionList[i].storeName}</a></li>
				`);
				$("#ruleBox .custom1 .dropdown-menu").append($Li);
			}
		})
		//  console.log('markersStoreList----',markersStoreList)
	}
    function loadScript(src, callback) {
		  var script = document.createElement('script'),
		  head = document.getElementsByTagName('head')[0];
		  script.type = 'text/javascript';
		  script.charset = 'UTF-8';
		  script.src = src;
		  if (script.addEventListener) {
		    script.addEventListener('load', function () {
		      callback();
		    }, false);
		  } else if (script.attachEvent) {
		    script.attachEvent('onreadystatechange', function () {
		      var target = window.event.srcElement;
		      if (target.readyState == 'loaded') {
		        callback();
		      }
		    });
		  }
		  head.appendChild(script);
	}