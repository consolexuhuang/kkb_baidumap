    //dateDropdown 构造
	function dateDropdown(dropdown){
		this.dropdown = dropdown;
        // this.setDom()
        var _this = this;
		$(document).on('click',''+_this.dropdown+' .dropdown-menu a',function(e){
            _this.select(e);
		})
	}
    //选择方法
	dateDropdown.prototype.select = function(e){
		// console.log($(e.target).parent()[0],$(e.target).parent()[0].id.replace(/-/g, ""))
        $('.custom1').find("button em").html('请选择门店关联订单列表'); 
        $(".custom1").find("ul>li").not(":first").remove();  //清除上一次新建的门店节点
        
		var currentDateId = $(e.target).parent()[0].id.replace(/-/g, "")
		var _text = $(e.target).text()
        console.log('当前选择的时间---',_text)
        
		parent = $(e.target).closest(this.dropdown); 
        $(parent).find("button em").html(_text);
     
        new DropdownSearch('.custom1', currentDateId);  //实例化门店
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