TouchTabsLA = function (opt) {
    var self,
    hammer,
    parentContainer,
    headerHeight,
    canSlideHorizontal = true,
    liItems,
    tabContents,
    lastTabPos = 0,
    lastScrollTop = 0,
    lastPageY = 0,
    line,
    itemsQtd,
        itemWidth, // largura padrão dos items
        fittings = [], // Valores que a linha pode ser encaixada
        fittingPossibilitty, // 70% do valor da largura dos items (possibilidade de encaixar posição na tab / aderencia)
        tabEvent = document.createEvent('Event');

    var TouchTabsLA = function () {
        self = this; // para evitar problemas de escopo

        this.lastPos = 0; // última posição
        this.currentTab = 1; // posição atual da linha
        this.currentPos = 0; // posição atual, dado a cada mover do 
        this.isActive = false;

        this.initializer();
    };

    TouchTabsLA.prototype.initializer = function () {
        if (opt.container && opt.content && opt.tabs && opt.header) {
            if (!opt.parent) {
                parentContainer = window;
            } else {
                parentContainer = opt.parent;
            }

            if (!parentContainer.offsetHeight) {
                parentContainer.offsetHeight = parentContainer.innerHeight;
            }

            if (!parentContainer.offsetWidth) {
                parentContainer.offsetWidth = parentContainer.innerWidth;
            }

            liItems = opt.tabs.querySelectorAll('li');
            tabContents = opt.content.querySelectorAll('.tab-content');
            itemsQtd = liItems.length;
            itemWidth = parentContainer.offsetWidth / itemsQtd;
            fittingPossibilitty = itemWidth * 0.70;
            headerHeight = opt.header.offsetHeight;

            self.createLine()
            .setWidth()
            .createFitings()
            .hammerInit()
            .setTabsClick()
            .setContainerSize()
            .onTabContentScroll()
            .onWindowResize()
            .createEvent();

            opt.tabs.style.transition = 'transform 0.3s ease';
            opt.tabs.style.webkitTransition = 'transform 0.3s ease';

            opt.header.style.transition = 'transform 0.3s ease';
            opt.header.style.webkitTransition = 'transform 0.3s ease';

            opt.container.style.transition = 'transform 0.3s ease';
            opt.container.style.webkitTransition = 'transform 0.3s ease';

            self.isActive = true;
        } else {
            console.error('Touch Tabs L.A: Options \'container\', \'content\', \'tabs\' and \'header\' are required. ');
            self.isActive = false;
        }
    };

    TouchTabsLA.prototype.createEvent = function () {
        tabEvent.initEvent('tabFocused', true, true);

        return self;
    };

    TouchTabsLA.prototype.createLine = function () {
        var lineEl = document.createElement('div');
        lineEl.setAttribute('id', 'stla-line');

        opt.tabs.appendChild(lineEl);

        line = document.querySelector('#stla-line');

        return self;
    };

    TouchTabsLA.prototype.setWidth = function () {
        itemWidth = opt.tabs.offsetWidth / itemsQtd;

        opt.content.style.width = (parentContainer.offsetWidth * itemsQtd) + 'px';

        for (var i = 0; i <= itemsQtd; i++) {
            if (tabContents[i] && liItems[i]) {
                liItems[i].style.width = itemWidth + 'px';
                tabContents[i].style.width = opt.container.offsetWidth + 'px';
                tabContents[i].style.left = (opt.container.offsetWidth * i) + 'px';
            }
        }

        line.style.width = itemWidth + 'px';

        return self;
    };

    // Cria um array com as posições de encaixe da linha
    TouchTabsLA.prototype.createFitings = function () {
        fittings = [];

        for (var i = 1; i <= itemsQtd; i++) {
            fittings.push({
                min: (itemWidth * i) - fittingPossibilitty,
                max: (itemWidth * i) + fittingPossibilitty,
                pos: i,
                posPx: (itemWidth * (i - 1))
            });
        }

        return self;
    };

    TouchTabsLA.prototype.setContainerSize = function () {
        opt.container.style.height = (parentContainer.offsetHeight - opt.tabs.offsetHeight) + 'px';

        return self;
    };

    TouchTabsLA.prototype.onTabContentScroll = function () {
        var scrollTimeOut,
            scrollSize = 0,
            lastScroll = 0;

        for (var i = 0; i <= itemsQtd; i++) {
            if (tabContents[i]) {
                tabContents[i].addEventListener('scroll', function (e) {
                    //opt.container.style.webkitTransition = 'none';
                    canSlideHorizontal = false;

                    scrollSize = lastScroll - lastPageY;

                    //if (Math.abs(scrollSize) <= 56) {
                    //    console.log(scrollSize);
                    //}
                    if (e.srcElement.scrollTop > lastPageY) {
                        if (this.scrollHeight > (parentContainer.offsetHeight - opt.tabs.offsetHeight) + 20) {
                            opt.tabs.style.webkitTransform = 'translate3d(0, -' + headerHeight + 'px, 0)';
                            opt.container.style.webkitTransform = 'translate3d(0, -' + headerHeight + 'px, 0)';
                            opt.header.style.webkitTransform = 'translate3d(0, -' + headerHeight + 'px, 0)';
                            //opt.container.style.paddingTop = '0';

                            opt.container.style.height = (parentContainer.offsetHeight - opt.tabs.offsetHeight) + 'px';
                        }
                        lastScrollTop = 0;
                    } else {
                        opt.tabs.style.webkitTransform = 'translate3d(0, 0, 0)';
                        opt.container.style.webkitTransform = 'translate3d(0, 0, 0px)';
                        opt.header.style.webkitTransform = 'translate3d(0, 0, 0)';
                        //opt.container.style.paddingTop = headerHeight + 'px';

                        opt.container.style.height = (parentContainer.offsetHeight - opt.tabs.offsetHeight - headerHeight) + 'px';

                        lastScrollTop = 0;
                    }

                    // fix to slide only 
                    clearTimeout(scrollTimeOut);
                    scrollTimeOut = setTimeout(function () {
                        clearTimeout(scrollTimeOut);

                        canSlideHorizontal = true;
                        lastScroll = e.srcElement.scrollTop;
                        scrollSize = 0;
                    }, 100);

                    lastPageY = e.srcElement.scrollTop;
                });
            }
        }

        return self;
    };

    TouchTabsLA.prototype.setTabsClick = function () {
        for (var i = 0; i < itemsQtd; i++) {
            liItems[i].addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                self.goToTab(
                    this.getElementsByTagName('a')[0]
                    .getAttribute('href')
                    .replace('#tab', '')
                    );

                lastTabPos = -self.currentPos * itemsQtd;
            });
        }

        return self;
    };

    TouchTabsLA.prototype.hammerInit = function () {
        hammer = new window.Hammer(opt.content);

        if (!opt.threshold) {
            opt.threshold = 0;
        }

        if (!opt.pointers) {
            opt.pointers = 1;
        }

        hammer.get('pan').set({
            threshold: opt.threshold, // A partir de quantos pixels começa o movimento
            pointers: opt.pointers, // Suporte multitouch, quantos pointeiros para fazer o movimento
            direction: window.Hammer.DIRECTION_HORIZONTAL // Somente vertical
        });

        self.setHammerEvents();

        return self;
    };

    TouchTabsLA.prototype.setHammerEvents = function () {
        hammer.on('panmove', function (e) {
            self.touchMove(e);
        });

        hammer.on('panend pancancel', function (e) {
            self.touchEnd(e);
        });
    };

    TouchTabsLA.prototype.moveTab = function (transition, pos) {
        line.style.webkitTransition = transition;
        line.style.webkitTransform = 'translate3d(' + pos + 'px, 0, 0)';

        opt.content.style.webkitTransition = transition;
        opt.content.style.webkitTransform = 'translate3d(' + (-pos * itemsQtd) + 'px, ' + lastScrollTop + 'px, 0)';
    };

    TouchTabsLA.prototype.touchMove = function (e) {
        e.deltaX = e.deltaX / itemsQtd;

        line.style.transition = 'none';

        if (canSlideHorizontal) {
            // Se passar do limite máximo
            if ((self.currentPos + itemWidth) >= (parentContainer.offsetWidth - 10)) {
                self.moveTab('transform 0.3s ease', (itemWidth * (itemsQtd - 1)));

                if (e.deltaX > 0) {
                    self.currentPos = self.lastPos - e.deltaX;
                    self.moveTab('none', self.currentPos);
                }
            } else if (self.currentPos <= 10) {
                self.moveTab('transform 0.3s ease', 0);

                if (e.deltaX < 0) {
                    self.currentPos = self.lastPos - e.deltaX;
                    self.moveTab('none', self.currentPos);
                }
            } else {
                self.currentPos = self.lastPos - e.deltaX;
                self.moveTab('none', self.currentPos);
            }
        }
    };

    TouchTabsLA.prototype.touchEnd = function (e) {
        self.lastPos = self.currentPos;

        if (canSlideHorizontal) {
            if (e.velocityX > 0.3) {
                self.goToTab(self.currentTab - 1, 'transform 0.3s ease');
            } else if (e.velocityX < -0.3) {
                self.goToTab(self.currentTab + 1, 'transform 0.3s ease');
            } else {
                for (var i = 0; i < fittings.length; i++) {
                    if (e.deltaX < 0) {
                        if ((self.lastPos + itemWidth) <= fittings[i].max) {
                            self.currentPos = fittings[i].posPx;
                            self.currentTab = fittings[i].pos;
                            i = fittings.length;
                        }
                    } else {
                        if (self.lastPos <= fittings[i].min) {
                            self.currentPos = fittings[i].posPx;
                            self.currentTab = fittings[i].pos;
                            i = fittings.length;
                        }
                    }
                }

                self.lastPos = self.currentPos;
                self.moveTab('transform 0.3s ease', self.currentPos);
            }

            lastTabPos = -self.currentPos * itemsQtd;
            //console.log(lastTabPos);

            if (opt.onTabChange) {
                opt.onTabChange.call(self);
            }

            tabContents[self.currentTab - 1].dispatchEvent(tabEvent);
        }

        // if(tabContents[self.currentTab - 1].scrollHeight <= tabContents[self.currentTab - 1].offsetHeight + 20){
        //     opt.tabs.style.webkitTransform = 'translate3d(0, 0, 0)';
        //     opt.container.style.webkitTransform = 'translate3d(0, 0, 0px)';
        //     opt.header.style.webkitTransform = 'translate3d(0, 0, 0)';
        //     opt.container.style.height = (parentContainer.offsetHeight - opt.tabs.offsetHeight - 56) + 'px';
        // }else{
        //     if(tabContents[self.currentTab - 1].scrollTop > 0){
        //         opt.tabs.style.webkitTransform = 'translate3d(0, -' + headerHeight + 'px, 0)';
        //         opt.container.style.webkitTransform = 'translate3d(0, -' + headerHeight + 'px, 0)';
        //         opt.header.style.webkitTransform = 'translate3d(0, -' + headerHeight + 'px, 0)';
        //         opt.container.style.height = (parentContainer.offsetHeight - opt.tabs.offsetHeight) + 'px';
        //     }
        // }
    };

    TouchTabsLA.prototype.onWindowResize = function () {
        if (opt.resize == true) {
            parentContainer.addEventListener('resize', function () {
                setTimeout(function () {
                    self.setWidth()
                    .createFitings()
                    .setContainerSize();
                }, 1000);

                self.moveTab('none', fittings[self.currentTab - 1].posPx);
                self.currentPos = fittings[self.currentTab - 1].posPx;
                self.lastPos = self.currentPos;
            });
        }

        return self;
    };

    TouchTabsLA.prototype.goToTab = function (num, transition) {
        var transitionVal = 'transform 0.3s ease';
        if (transition == false) {
            transitionVal = 'none';
        }

        if (fittings[num - 1]) {
            self.moveTab(transitionVal, fittings[num - 1].posPx);
            self.currentPos = fittings[num - 1].posPx;
            self.currentTab = fittings[num - 1].pos;
            self.lastPos = self.currentPos;

            if (opt.ontabfocused) {
                tabContents.ontabfocused.call(self);
            }

            tabContents[self.currentTab - 1].dispatchEvent(tabEvent);
        } else {
            //console.warn('A aba ' + num + ' não existe.');
        }
    };

    return new TouchTabsLA();
};