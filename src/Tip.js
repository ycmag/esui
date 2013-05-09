define(
    function (require) {
        var lib = require('./lib');
        var helper = require('./controlHelper');
        var Control = require('./Control');
        var ui = require('./main');
        var paint = require('./painters');

        /**
         * 提示控件类
         * 
         * @constructor
         * @param {Object} options 初始化参数
         */
        function Tip(options) {
            Control.apply(this, arguments);
        }

        Tip.prototype.type = 'Tip';

        /**
         * 初始化参数
         *
         * @param {Object} options 构造函数传入的参数
         * @override
         * @protected
         */
        Tip.prototype.initOptions = function (options) {
            /**
             * 默认选项配置
             */
            var properties = {
                title: '',
                content: '',
                arrow: 'tl',
                mode: 'over',
                hideDelay: '100',
                showDelay: '100'
            };
            lib.extend(properties, options);
            this.setProperties(properties);
        };

        /**
         * 创建主元素
         *
         * @param {Object} options 构造函数传入的参数
         * @return {HTMLElement} 主元素
         * @override
         * @protected
         */
        Tip.prototype.createMain = function (options) {
            return document.createElement('aside');
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        Tip.prototype.initStructure = function () {
            var showEvent = this.mode === 'click' ? 'click' : 'mouseover';
            var hideEvent = 'mouseout';

            helper.addDOMEvent(
                this, this.main, showEvent,
                lib.bind(this.show, this)
            );
            helper.addDOMEvent(
                this, this.main, hideEvent,
                lib.bind(this.hide, this)
            );
        };

        /**
         * 创建layer
         *
         * @param {Tip} tip Tip控件实例
         * @param {Event} e 触发事件的事件对象
         */
        function createLayer(tip, e) {
            layer = helper.layer.create('div');
            layer.id = helper.getId(tip, 'layer');
            layer.className = helper.getPartClasses(tip, 'layer').join(' ');

            var title = document.createElement('h3');
            var body = document.createElement('div');
            var arrow = helper.layer.create('div');

            // 初始化提示标题
            title.id = helper.getId(tip, 'title');
            title.className = helper.getPartClasses(tip, 'title').join(' ');
            layer.appendChild(title);

            // 初始化提示体
            body.id = helper.getId(tip, 'body');
            body.className = helper.getPartClasses(tip, 'body').join(' ');
            layer.appendChild(body);

            // 初始化箭头
            arrow.id = helper.getId(tip, 'arrow');
            arrow.className = helper.getPartClasses(tip, 'arrow').join(' ');
            layer.appendChild(arrow);

            document.body.appendChild(layer);
            helper.layer.attachTo(
                layer, 
                tip.main, 
                { top: 'bottom', left: 'left'}
            );

            tip.repaint();
        }

        /**
         * 修改箭头位置
         *
         * @param {Tip} tip Tip控件实例
         * @param {string} value 箭头位置变量
         */
        function positionArrow(tip, value) {
            // 箭头的class形如`ui-tip-arrow ui-tip-arrow-tl`
            var classes = helper.getPartClasses(tip, 'arrow');
            if (typeof value === 'string') {
                classes = classes.concat(
                    helper.getPartClasses(tip, 'arrow-' + value));
            }
            var arrowElement = lib.g(helper.getId(tip, 'arrow'));           
            arrowElement.className = classes.join(' ');
        }

        /**
         * 显示弹层
         *
         * @public
         */
        Tip.prototype.show = function () {
            clearTimeout(this.hideTime); //清除隐藏定时器
            clearTimeout(this.showTime);

            function show () {
                var layer = lib.g(helper.getId(this, 'layer'));
                if (!layer) {
                    layer = createLayer(this);
                }
                helper.removePartClasses(this, 'layer-hidden', layer);
            }

            this.showTime = setTimeout(lib.bind(show, this), this.showDelay);
        };
        /**
         * 隐藏弹层
         *
         * @public
         */
        Tip.prototype.hide = function () {
            // 先清除各种定时器。
            clearTimeout(this.hideTime);
            clearTimeout(this.showTime);
            var layer = lib.g(helper.getId(this, 'layer'));

            function hide() {
                helper.addPartClasses(this, 'layer-hidden', layer);
            }

            if (layer) {
                this.hideTime = 
                    setTimeout(lib.bind(hide, this), this.hideDelay);
            }
        };

        /**
         * 重绘
         *
         * @protected
         */
        Tip.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            paint.html('title', 'title'),
            paint.html('content', 'body'),
            {
                name: 'arrow',
                paint: function (tip, value) {
                    if (tip.layer) {
                        positionArrow(tip, value);
                    }
                }
            }
        );

        /**
         * 销毁控件
         *
         * @override
         * @public
         */
        Tip.prototype.dispose = function () {
            var layer = lib.g(helper.getId(this, 'layer'));
            if (layer) {
                layer.parentNode.removeChild(layer);
            }

            Control.prototype.dispose.apply(this, arguments);
        };

        lib.inherits(Tip, Control);
        ui.register(Tip);
        return Tip;
    }
);