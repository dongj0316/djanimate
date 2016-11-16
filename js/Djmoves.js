;
(function(w, d, afactory) {
    var factory = afactory(w, d);

    w.DJ = w.DJ || {};

    w.DJ.move = w.DJ.move || factory;

})(this, document, function(w, d) {
    //定时器,动画属性,初始属性值,位移量,运动时执行函数,动画是否开始
    var globaltimer = null,
        amtattr = {},
        atStartAt = {},
        differAt = {},
        movefn = {},
        isStart = false;
    //构造函数
    function Djmove(s) {
        if (!s) {
            throw new TypeError(s + " is null or not defined");
        }
        //操作对象
        this.elem = s;
        //唯一ID
        this.elem.uniqueId = this.elem.uniqueId || Math.random();
    }
    //动画队列
    Djmove.prototype.animates = {};
    //开启全局定时器
    Djmove.prototype.timer = function() {
        var amts = this.animates;
        globaltimer = setInterval(function() {
            for (var i in amts) {
                amts[i]();
            }
        }, 13);
    };
    //属性添加
    Djmove.prototype.amtattrPush = function(attr) {
        amtattr[this.elem.uniqueId] = amtattr[this.elem.uniqueId] || {};
        //对象复制，重名使用新的参数值
        amtattr[this.elem.uniqueId] = this._extend(amtattr[this.elem.uniqueId], attr);
        return this;
    };
    //初始时间和属性值
    Djmove.prototype.atStartPush = function() {
        var dattr = amtattr[this.elem.uniqueId];
        atStartAt[this.elem.uniqueId] = atStartAt[this.elem.uniqueId] || {};
        differAt[this.elem.uniqueId] = differAt[this.elem.uniqueId] || {};
        //元素每个属性动画开始的时间、初始属性、运动量
        for (var i in dattr) {
            atStartAt[this.elem.uniqueId][i] = parseInt(this.getStyle(this.elem, i));
            differAt[this.elem.uniqueId][i] = dattr[i] - parseInt(this.getStyle(this.elem, i));
        }
        return this;
    };
    //动画函数
    Djmove.prototype.animatePush = function(speedtype, speed, callBack, movingfn) {
        //参数
        var dattr = amtattr[this.elem.uniqueId],
            sattr = atStartAt[this.elem.uniqueId],
            dfattr = differAt[this.elem.uniqueId],
            stime = new Date(),
            _t = this;
        movefn[this.elem.uniqueId] = movefn[this.elem.uniqueId] || movingfn;

        this.animates[this.elem.uniqueId] = this.animates[this.elem.uniqueId] || function() {};
        //当前动画元素的动画函数
        this.animates[this.elem.uniqueId] = function() {
            var nowat,nowt;
            //遍历
            for (var t in dattr) {
                nowt = (new Date()) - stime;
                //当前运动量
                nowat = _t[speedtype](nowt, sattr[t], dfattr[t], speed);
                //达到目标点从动画属性中删除
                if (nowt/speed >= 1) {
                    nowat = dattr[t];
                    _t.elem.style[t] = dattr[t] + 'px';
                    delete dattr[t];
                    //动画列中无此元素属性了执行回调
                    if (_t.isFinished(_t.elem.uniqueId)) {
                        movefn[_t.elem.uniqueId] && movefn[_t.elem.uniqueId](_t.elem);
                        delete amtattr[_t.elem.uniqueId];
                        delete movefn[_t.elem.uniqueId];
                        //检测是否完成所有动画,清除定时器
                        if (_t.isEnd()) {
                            isStart = false;
                            clearInterval(globaltimer);
                        }
                        callBack && callBack(_t, _t.elem);
                    }
                } else _t.elem.style[t] = nowat + 'px';
            }
            movefn[_t.elem.uniqueId] && movefn[_t.elem.uniqueId](_t.elem);
        }
        return this;
    };
    //开启动画
    Djmove.prototype.animate = function(attr, speedtype, speed, callBack, movingfn) {
        //参数判断
        var ag1, ag2, ag3, ag4, fnnum = 0;

        if (Object.prototype.toString.call(attr) !== '[object Object]') {
            throw TypeError();
        }
        for (var i = 1; i < arguments.length; i++) {
            if (typeof arguments[i] === 'string') ag1 = arguments[i];
            else if (typeof arguments[i] === 'function') {
                if(ag3) ag4 = arguments[i];
                else ag3 = ag3 || arguments[i];
            }
            else if (!isNaN(arguments[i])) ag2 = arguments[i];
        }
        speedtype = ag1 ? ag1 : 'linear';
        speed = ag2 ? ag2 : 400;
        callBack = ag3 ? ag3 : undefined;
        movingfn = ag4 ? ag4 : undefined;
        //属性添加、刷新时间和属性、刷新动画函数
        this.amtattrPush(attr).atStartPush().animatePush(speedtype, speed, callBack, movingfn);
        //开启定时器
        if (!isStart) {
            this.timer();
            isStart = true;
        }
    };
    //检测当前元素动画是否完成
    Djmove.prototype.isFinished = function(id) {
        for (var k in amtattr[id]) {
            return !1;
        }
        return !0;
    };
    //检测所有元素动画是否完成
    Djmove.prototype.isEnd = function() {
        for (var t in amtattr) {
            return !1;
        }
        return !0;
    };
    //停止动画
    Djmove.prototype.stop = function() {
        //删除正在过渡的所有属性
        for (var t in amtattr[this.elem.uniqueId]) {
            delete amtattr[this.elem.uniqueId][t];
        }
        delete amtattr[this.elem.uniqueId]
            //检测是否完成所有动画,清除全局定时器
        if (this.isEnd()) {
            clearInterval(globaltimer);
            isStart = false;
        }
    };
    //t：当前流失时间 b：初始属性 c：变化量 d：给定的动画时间
    //匀速运动
    Djmove.prototype.linear = function(t, b, c, d) {
        if ((t /= d) < 1) {
            return b + t * c;
        }
        return c + b;
    };
    //减速
    Djmove.prototype.easeOut = function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    };
    //加速减速曲线
    Djmove.prototype.easeBoth = function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    };
    //加加速减减速曲线
    Djmove.prototype.easeBothStrong = function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t + b;
        }
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    };
    //正弦增强曲线（弹动渐出）
    Djmove.prototype.elasticOut = function(t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else {
            var s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    };
    //弹球渐出
    Djmove.prototype.bounceOut = function(t, b, c, d){
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
        }
        return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
    };
    //extend
    Djmove.prototype._extend = function(o, p) {
        for (var at in p) {
            o[at] = p[at];
        }
        return o;
    };
    //getStyle
    Djmove.prototype.getStyle = function(obj, attr) {
        return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
    };



    //对外接口
    return function(elem) {
        return new Djmove(elem);
    };
});
