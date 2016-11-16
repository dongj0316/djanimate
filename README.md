# djanimate
animate/move
###demo[应用实例](https://dongj0316.github.io/djanimate/)
##  运动类型：
 * linear：默认匀速
 * easeOut：减速
 * easeBoth：加速减速
 * easeBothStrong：加加速减减速
 * elasticOut：弹性渐出
 * bounceOut：弹球渐出
    
调用方法：
```javascript
    var oD = document.getElementById('div'),
				mD = DJ.move(oD);
		oD.onclick = function(){
			this.parentNode.children[1].innerHTML = '';
			mD.animate({'width':200,'height':200,'marginTop':-100},300,'bounceOut',function(t){
      //结束回调
				t.animate({'width':50,'height':50,'marginTop':-25},function(){},function(d){
					//动画运行时执行
				});
			},function(d){
        //动画运行时执行
				d.parentNode.children[1].innerHTML+='当前width：'+d.offsetWidth + '<br>';
			});
		}
    //....
```
