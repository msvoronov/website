/*
HTML
<body>		
	<div class="wrapper">

	    <div data-spoilers data-one-spoiler class="block"> - Родитель спойлера 
			<div class="block__item">
				<button tabindex="-1" type="button" data-spoiler class="block__title">Обычный спойлер №1</button> - Заголовок спойлера
				<div class="block__text">Lorem ipsum dolor sit, amet consectetur adipisicing elit.</div> - Контент спойлера
			</div>
			<div class="block__item">
				<button tabindex="-1" type="button" data-spoiler class="block__title">Обычный спойлер №2</button>
				<div class="block__text">Lorem ipsum dolor sit, amet consectetur adipisicing elit.</div>
			</div>				
		</div>

		<div data-spoilers="650,min" class="block">
			<div class="block__item">
				<button tabindex="-1" type="button" data-spoiler class="block__title">Спойлер работает на экаранах >= 650px</button>
				<div class="block__text">Lorem ipsum dolor sit, amet consectetur adipisicing elit.</div>
			</div>
		</div>

		<div data-spoilers="800,max" class="block">
			<div class="block__item">
				<button tabindex="-1" type="button" data-spoiler class="block__title">Спойлер #1 работает на экаранах <= 800px</button>
				<div class="block__text">Lorem ipsum dolor sit, amet consectetur adipisicing elit.</div>
			</div>
			<div class="block__item">
				<button tabindex="-1" type="button" data-spoiler class="block__title">Спойлер #1 работает на экаранах <= 800px</button>
				<div class="block__text">Lorem ipsum dolor sit, amet consectetur adipisicing elit.</div>
			</div>
		</div>

	</div>				
	<script src="js/spoilers.js"></script>
</body>
*/

/*
SCSS
.wrapper {
    min-height: 100%;    
}

.block {    

	&__item {                
	}

	&__title {
        width: 100%;         
        position: relative;

        .block._init & {
            cursor: pointer;            

            &::before, &::after { //before и after рисуют плюс/минус. при необходимости - перестилизировать
                content: '';
                width: 10px;
                height: 1px;    
                background-color: #000;
                position: absolute;
                right: 10px;
                top: 10px;
                transition: transform 0.3s ease 0s;
            }
            &::after {
                transform: rotate(-90deg);
            }
            &._active::after {
                transform: rotate(0deg);
            }
        }
	}

	&__text {        
	}
}
*/

// ============================================================== Удалить всё, что выше этой строчки, и её саму тоже =========
/*
Для родителя сполйеров пишем атрибут data-spoilers
Для заголовков спойлеров пишем атрибут data-spoiler
Если нужно включать/выключать работу спойлеров на разных размеров экранов
пишем параметы ширины и типы брейкпойнта.
Например:
data-spoilers="992,max" - спойлеры будут работать только на экранах меньше или равно 992px
data-spoilers="768,min" - спойлеры будут работать только на экранах больше или равно 768px

Если нужно что бы в блоке открывался только один сполйер добавляем атрибут data-one-spoiler
*/
'use strict'

// SPOILERS
const spoilersArray = document.querySelectorAll('[data-spoilers]');
if (spoilersArray.length > 0) {
    // Получение обычных спойлеров
    const spoilersRegular = Array.from(spoilersArray).filter(function (item, index, self) {
        return !item.dataset.spoilers.split(",")[0];
    });
    // Инициализация обычных спойлерв
    if (spoilersRegular.length > 0) {
        initSpoilers(spoilersRegular);
    }
    // Получение спойлеров c медиазапросами
    const spoilersMedia = Array.from(spoilersArray).filter(function (item, index, self) {
        return item.dataset.spoilers.split(",")[0];
    });
    // Инициализация спойлеров c медиазапросами
    if (spoilersMedia.length > 0) {
        const breakpointsArray = [];
        spoilersMedia.forEach(item => {
            const params = item.dataset.spoilers;
            const breakpoint = {};
            const paramsArray = params.split(",");
            breakpoint.value = paramsArray[0];
            breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
            breakpoint.item = item;
            breakpointsArray.push(breakpoint);
        });

        // Получаем уникальные брейкпойнты
        let mediaQueries = breakpointsArray.map(function (item) {
            return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;            
        });
        mediaQueries = mediaQueries.filter(function (item, index, self) {
            return self.indexOf(item) === index;
        });

        // Работаем с каждым брейкпоинтом
        mediaQueries.forEach(breakpoint => {
            const paramsArray = breakpoint.split(",");
            const mediaBreakpoint = paramsArray[1];
            const mediaType = paramsArray[2];
            const matchMedia = window.matchMedia(paramsArray[0]);

            // Объекты с нужными условиями
            const spoilersArray = breakpointsArray.filter(function (item) {
                if (item.value === mediaBreakpoint && item.type === mediaType) {
                    return true;
                }
            });
            // Событие
            matchMedia.addListener(function () {
                initSpoilers(spoilersArray, matchMedia);
            });
            initSpoilers(spoilersArray, matchMedia);
        });
    }
    // Инициализация
    function initSpoilers(spoilersArray, matchMedia = false) {
        spoilersArray.forEach(spoilersBlock => {
            spoilersBlock = matchMedia ? spoilersBlock.item : spoilersBlock;
            if (matchMedia.matches || !matchMedia) {
                spoilersBlock.classList.add('_init');
                initSpoilerBody(spoilersBlock);
                spoilersBlock.addEventListener('click', setSpoilerAction);                
            } else {
                spoilersBlock.classList.remove('_init');
                initSpoilerBody(spoilersBlock, false);
                spoilersBlock.removeEventListener('click', setSpoilerAction);
            }
        });
    }
    // Работа с контентом
    function initSpoilerBody(spoilersBlock, hideSpoilersBody = true) {
        const spoilerTitles = spoilersBlock.querySelectorAll('[data-spoiler]');
        if (spoilerTitles.length > 0) {
            spoilerTitles.forEach(spoilerTitle => {
                if (hideSpoilersBody) {
                    spoilerTitle.removeAttribute('tabindex');
                    if (!spoilerTitle.classList.contains('_active')) {
                        spoilerTitle.nextElementSibling.hidden = true;
                    }
                } else {
                    spoilerTitle.setAttribute('tabindex', '-1');
                    spoilerTitle.nextElementSibling.hidden = false;
                }
            });
        }
    }
    function setSpoilerAction(e) {
        const el = e.target;
        if (el.hasAttribute('data-spoiler') || el.closest('[data-spoiler]')) {
            const spoilerTitle = el.hasAttribute('data-spoiler') ? el : el.closest('[data-spoiler]');
            const spoilersBlock = spoilerTitle.closest('[data-spoilers]');
            const oneSpoiler = spoilersBlock.hasAttribute('data-one-spoiler') ? true : false;
            if (!spoilersBlock.querySelectorAll('._slide').length) {
                if (oneSpoiler && !spoilerTitle.classList.contains('_active')) {
                    hideSpoilersBody(spoilersBlock);
                }                
                spoilerTitle.classList.toggle('_active');
                _slideToggle(spoilerTitle.nextElementSibling, 500);
            }            
            e.preventDefault();
        }                
    }
    function hideSpoilersBody(spoilersBlock) {
        const spoilerActiveTitle = spoilersBlock.querySelector('[data-spoiler]._active');
        if (spoilerActiveTitle) {
            spoilerActiveTitle.classList.remove('_active');
            _slideUp(spoilerActiveTitle.nextElementSibling, 500);
        }
    }
}

//=============
// SlideToggle
let _slideUp = (target, duration = 500) => {
    if (!target.classList.contains('_slide')) {
        target.classList.add('_slide');
        target.style.transitionProperty = 'height, margin, padding';
        target.style.transitionDuration = duration + 'ms';
        target.style.height = target.offsetHeight + 'px';
        target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        window.setTimeout(() => {
            target.hidden = true;
            target.style.removeProperty('height');
            target.style.removeProperty('padding-top');
            target.style.removeProperty('padding-bottom');
            target.style.removeProperty('margin-top');
            target.style.removeProperty('margin-bottom');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
        }, duration);
    }
}
let _slideDown = (target, duration = 500) => {
    if (!target.classList.contains('_slide')) {
        target.classList.add('_slide');
        if (target.hidden) {
            target.hidden = false;
        }
        let height = target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        target.offsetHeight;
        target.style.transitionProperty = 'height, margin, padding';
        target.style.transitionDuration = duration + 'ms';
        target.style.height = height + 'px';
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        window.setTimeout(() => {
            target.style.removeProperty('height');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
        }, duration);
    }
}
let _slideToggle = (target, duration = 500) => {
    if (target.hidden) {        
        return _slideDown(target, duration)
    } else {
        return _slideUp(target, duration)
    }
}