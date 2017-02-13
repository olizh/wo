/* jshint devel:true */
(function(){
	'use strict';
	var currentVersion = '0.0.4';
	var webViewType;
	var verticalScrollOpts = {
	    scrollingX: false,
	    bouncing: false,
	    snapping: false,
	    scrollbars: true,
	    scrollBoundary: 8,
	    updateOnChanges: true,
	    updateOnWindowResize: true,
	    windowScrollingActiveFlag: 'gFTScrollerActive'
	};
	var gCourseIntroScroller, gHomePageScroller;

	var gSlideScrollers = [];

	var courseStatus = {
		action: 'next',
		len: 0,
		current: 0,
		buttonDisable: false,
		score: 0,
		lostScore: 0,
		fullScore: 0,
		passMark: 60,
		allPoints: [],
		nextSession: '',
		currentSession: '',
		page: '',
		courseTitle: '',
		courseId: '',
		hasSingleSession: false,
		courseIntro: {}
	};



	var captions = {
		language: 'ch',
		text: {
			appTitle: {
				en: 'Drucker Academy',
				ch: '德鲁克门徒'
			},
			start: {
				en: 'START',
				ch: '开始'
			},
			back: {
				en: 'BACK',
				ch: '返回'
			},
			close: {
				en: 'CLOSE',
				ch: '关闭'
			}, 
			confirm: {
				en: 'CONFIRM',
				ch: '确定'
			},
			next: {
				en: 'NEXT',
				ch: '继续'
			},
			review: {
				en: 'REVIEW',
				ch: '重温'
			},
			retry: {
				en: 'RETRY',
				ch: '重试'
			},
			share: {
				en: 'SHARE',
				ch: '分享'
			},
			nextSession: {
				en: 'Next Session',
				ch: '下一节'
			},
			scoreIntro: {
				en: 'You scored ',
				ch: '您答对'
			},
			pointsIntro: {
				en: 'Key Points of This Session: ',
				ch: '本节的关键点：'
			},
			trueOrFalse: {
				en: 'True or False',
				ch: '是非'
			},
			trueStatement: {
				en: 'True',
				ch: '正确'
			},
			falseStatement: {
				en: 'False',
				ch: '错误'
			},
			prevItem: {
				en: 'PREV',
				ch: '上一个'
			},
			nextItem: {
				en: 'NEXT',
				ch: '下一个'
			},
			correct: {
				en: 'Correct',
				ch: ['回答正确','非常棒','恭喜答对','正确','答对了']
			},
			wrong: {
				en: 'Wrong',
				ch: ['回答错误','错误','很遗憾']
			}
		}
	};




	// if url has isInSWIFT
	// display extra 20px 
	// at the top for native app status bar
	if (location.href.indexOf('isInSWIFT') > 0) {
		document.getElementsByTagName('HTML')[0].classList.add('is-in-swift');
		webViewType = 'wkwebview';
	}


	var gAppRoot=window.location.href;
	gAppRoot = gAppRoot
		.replace(/course=[^&]+/g,'')
		.replace(/session=[^&]+/g,'')
		.replace(/#.*$/g,'')
		.replace(/\&+$/g,'');
	if (gAppRoot.indexOf('?')<0) {
		gAppRoot += '?isWebApp';
	}
	console.log (gAppRoot);


	// initiate fast click
	if ('addEventListener' in document) {
	    document.addEventListener('DOMContentLoaded', function() {
	        FastClick.attach(document.body);
	    }, false);
	}

	// check local storage
	var courseHistory = {};
	var courseHistoryString = '';

	// initiate course progress
	try {
		courseHistoryString = localStorage.getItem('courseHistory') || '';
		courseHistory = (courseHistoryString !== '') ? JSON.parse(courseHistoryString) : {};
	} catch (ignore) {

	}

	// console.log ('initial course progress');
	// console.log (courseHistory);


	function getpvalue(theurl, thep) {
	    var k,thev;
	    if (theurl.toLowerCase().indexOf(thep + '=')>1) {
	        k = theurl.toLowerCase().indexOf(thep) + thep.length + 1;
	        thev = theurl.toLowerCase().substring(k,theurl.length);
	        thev = thev.replace(/\&.*/g,'');
	    } else {
	        thev = '';
	    }
	    return thev;
	}

	//运行环境检测
	function historyAPI() {
	    var ua = navigator.userAgent || navigator.vendor || '';
	     // Android 2
	    if (/Android 2/i.test(ua)) {
	        return false;
	    }
	    // Return the regular check
	    if (window.history && window.history.pushState) {
	        return true;
	    }
	}

	// get api from wkwebview first, if it doesn't work, fall back to web
    function getAPI(apiUrl, callback, errorHandler){
    	var errorType = 'unknown';
        if(typeof callback == 'function') {
        	if (webViewType === 'wkwebview') {
        		window.jsAPIData = undefined;
        		try {
        			webkit.messageHandlers.jsapi.postMessage(apiUrl);
	        		setTimeout(function(){
	        			//var jsAPIData = JSON.parse(jsAPIString);
	        			if (typeof jsAPIData === 'object') {
	        				callback(window.jsAPIData);
	        			} else {
				        	$.get(apiUrl, function(data) {
				        		callback(data);	
				        	}).fail(errorHandler);
	        			}
	        		}, 300);
        		} catch (err) {
        			console.log (err);
		        	$.get(apiUrl, function(data) {
		        		callback(data);	
		        	}).fail(errorHandler);
        		}
        	} else {
	        	$.get(apiUrl, function(data) {
	        		callback(data);	
	        	}).fail(errorHandler);
        	}
        }
    }



	function playNativeSoundEffect(effect) {
		if (webViewType === 'wkwebview') {
			try {
				webkit.messageHandlers.callbackHandler.postMessage(effect);
			} catch (ignore) {

			}
		}
	}

	function getCaption(captionName) {
		var currentCaption = captions.text[captionName][captions.language]
		if (typeof currentCaption === 'string') {
			return currentCaption;
		} else if (typeof currentCaption === 'object') {
			return currentCaption[Math.floor(currentCaption.length * Math.random())];
		} else {
			return '';
		}
	}
	
	function backButton() {
		if (courseStatus.current > 0 && courseStatus.current < courseStatus.len -1) {
			courseStatus.current -= 1;
			openPage (courseStatus.current);
			if (courseStatus.current > 0) {
				$('#n-header__close').addClass('on');
			}
		} else {
			closeButton();
		}
	}

	function closeButton() {
		if (courseStatus.page === 'session' && courseStatus.hasSingleSession === false) { 
			courseStatus.page = 'course';
			courseStatus.current = 0;
			document.body.className = 'n-in-course-intro';
			document.getElementById('n-header-title').innerHTML = courseStatus.courseTitle;
			if (historyAPI() === true) {
		       	window.history.pushState(null, null, gAppRoot + '&course=' + courseStatus.courseId);
			}
		} else {
			// back to home page
			courseStatus.page = '';
			document.body.className = '';
			document.getElementById('n-header-title').innerHTML = getCaption('appTitle');
			// update the url to display 
			if (historyAPI() === true) {
		       	window.history.pushState(null, null, gAppRoot);
			}
		}
	}

	function shuffleArray(array) {
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array;
	}

	function openPage(page) {
		var allPages = $('#n-course-inner .n-page');
		var currentPage = allPages.eq(page);
		var courseButton = $('#n-course-button');
		var scoreRate = 0;
		var scoreClass = '';
		var points = '';
		var progressBar = $('#n-progress-inner .n-progress');
		var scrollerEle = currentPage.find('.n-overflow-scroll-y');
		var scrollerEleInner = scrollerEle.find('.n-overflow-scroll-y-inner');
		var scrollerHeight = 0;
		var scrollerInnerHeight = 0;
		var sessionTitleEle;
		page = parseInt(page, 10);
		progressBar.removeClass('on');
		progressBar.slice(0, page).addClass('on done');
		courseStatus.current = page;
		allPages.removeClass('n-page-on').removeClass('n-page-next').removeClass('n-page-prev');
		currentPage.addClass('n-page-on');
		if (page > 0) {
			allPages.eq(courseStatus.current - 1).addClass('n-page-prev');
		} else if (courseStatus.current === 0) {
			allPages.eq(courseStatus.len-1).addClass('n-page-prev');
		}
		if (page === courseStatus.len -1) {
			// display scores and feedbacks in last page
			allPages.eq(0).addClass('n-page-next');
			// score displays once
			if (courseStatus.fullScore > 0 && currentPage.hasClass('done') === false) {
				scoreRate = 100 * courseStatus.score/courseStatus.fullScore;
				scoreRate = Math.round(scoreRate);
				courseStatus.scoreRate = scoreRate;



				if (scoreRate >= courseStatus.passMark) {
					scoreClass = 'good';
					playNativeSoundEffect('success');
				} else {
					scoreClass = 'bad';
				}


				// update course history
				if (courseHistory[courseStatus.courseId] === undefined) {
					courseHistory[courseStatus.courseId] = {};
				}
				if (courseHistory[courseStatus.courseId][courseStatus.currentSession] === undefined) {
					courseHistory[courseStatus.courseId][courseStatus.currentSession] = {};						
				}
				courseHistory[courseStatus.courseId][courseStatus.currentSession].score = scoreRate;
				courseHistory[courseStatus.courseId][courseStatus.currentSession].scoreClass = scoreClass;
				// console.log (courseHistory);
				// save the history data here
				try {
					courseHistoryString = JSON.stringify(courseHistory);
					localStorage.setItem('courseHistory', courseHistoryString);
					// console.log ('saved course history');
					// console.log (courseHistoryString);
				} catch (err) {
					console.log (err);
				}
				// update the course session title list
				sessionTitleEle = $('#session-title-'+courseStatus.courseId+'-'+courseStatus.currentSession);
				sessionTitleEle.find('.n-session-score').html(scoreRate);
				sessionTitleEle.removeClass('good, bad').addClass(scoreClass);

				$.each(courseStatus.allPoints, function(entryIndex, entry) {
					var pointClass = (entry.right === true)? 'right': 'wrong';
					var firstChildClass = (entryIndex === 0)? ' first-child': '';
					var pointText = entry.point;
					if (!/[。！？\.]$/.test(pointText)) {
						pointText += '。';
					}
					points += '<div class="n-point n-' + pointClass + '-point'+firstChildClass+'" page="'+entry.page+'">' + pointText + '</div>';
				});
				points = '<div class="n-points-container">' + points + '</div>';
				currentPage.find('.n-page-title').html(getCaption('scoreIntro') + '<span class="' + scoreClass + '">' + scoreRate + '%</span>');
				currentPage.find('.n-page-lead').html('<div>' + getCaption('pointsIntro') + '</div>' + points);
			}
			currentPage.addClass('done');
		} else if (courseStatus.current < courseStatus.len -1) {
			allPages.eq(courseStatus.current + 1).addClass('n-page-next');
		}
		// handle courseButton


		if (page === courseStatus.len -1) {
			//console.log (courseStatus.scoreRate + ' vs ' + courseStatus.passMark);

			courseButton.removeClass('disabled');
			courseStatus.buttonDisable = false; 
			if (courseStatus.scoreRate >= courseStatus.passMark) {
				courseStatus.action = 'nextSession';
				courseButton.html(getCaption('nextSession'));
			} else {
				courseStatus.action = 'retry';
				courseButton.html(getCaption('retry'));
			}
		} else if ((currentPage.hasClass('n-page-quiz') === true || currentPage.hasClass('n-page-true-false') === true || currentPage.hasClass('n-page-input') === true) && currentPage.hasClass('done') === false) {
			courseButton.html(getCaption('confirm'));
			courseButton.addClass('disabled');
			courseStatus.buttonDisable = true; 
			courseStatus.action = 'confirm';
			// if (currentPage.hasClass('n-page-input')) {
			// 	currentPage.find('.n-input').focus();	
			// }
		} else {
			courseButton.html((page === courseStatus.len -1) ? getCaption('review') : (page === 0) ? getCaption('start') : getCaption('next'));
			courseButton.removeClass('disabled');
			courseStatus.buttonDisable = false; 
			courseStatus.action = 'next';
		}
		$('#n-header__close').removeClass('on');

		//if there's overflowed content
		//initialize FTScroller
		if (scrollerEle.hasClass('ftscroller-on')=== false && scrollerEle.length>0 && scrollerEleInner.length>0) {
			scrollerHeight = scrollerEle.innerHeight();
			scrollerInnerHeight = scrollerEleInner.outerHeight();
			//console.log (scrollerEle.hasClass('n-overflow-scroll-force'));
			if ((scrollerHeight < scrollerInnerHeight) || scrollerEle.hasClass('n-overflow-scroll-force') === true) {
				//console.log ('FTScroller Needed');
				gSlideScrollers[page] = new FTScroller(scrollerEle.get(0), verticalScrollOpts);
				scrollerEle.addClass('ftscroller-on');
			}
		}
	}

	function openCourse(courseId, courseTitle) {
		var id = courseId.replace(/^.*course\//g, '');
		var apiUrl = 'api/courses/course' + id + '/index.json';
		var chapterCount = 0;
		courseStatus.hasSingleSession = false;
		courseStatus.page = 'course';
		courseStatus.courseId = id;
		courseStatus.courseTitle = courseTitle; 
		document.getElementById('n-course-intro-inner').innerHTML = '<div class="n-loading">加载中...</div>';
		if (typeof courseTitle !== undefined) {
			document.getElementById('n-header-title').innerHTML = courseTitle;
		}
		document.body.className = 'n-in-course-intro';

		getAPI(
			apiUrl, 
			function(data) {
			var courseHTML = '';
			courseStatus.courseIntro = data;
			chapterCount = data.content.length;
			if (chapterCount === 1) {
				if (data.content[0].sessions.length === 1) {
					courseStatus.hasSingleSession = true;
				}
			}
			if (courseStatus.hasSingleSession === false) {
				$.each(data.content, function(entryIndex, entry) {
					courseHTML += '<div class="n-chapter-title">' + entry.title + '</div>';
					$.each(entry.sessions, function(sessionIndex, session) {
						var sessionScore = '';
						var sessionClass = '';
						if (courseHistory[id] && courseHistory[id][session.id]) {
							sessionScore = courseHistory[id][session.id].score || '';
							sessionClass = courseHistory[id][session.id].scoreClass || '';
						}
						if (sessionClass !== '') {
							sessionClass = ' ' + sessionClass;
						}
						sessionScore = '<div class="n-session-score">' + sessionScore + '</div>';
						courseHTML += '<div id="session-title-'+courseStatus.courseId+'-'+ session.id + '" session-id="' + session.id + '" class="n-session-title' + sessionClass + '">' + sessionScore + session.title + '</div>';
					});
				});
				document.getElementById('n-course-intro-inner').innerHTML = courseHTML;
				//add scroller to course intro page
				if (typeof gCourseIntroScroller !== 'object') {
			        gCourseIntroScroller = new FTScroller(document.getElementById('n-course-intro-container'), verticalScrollOpts);
			    }
			} else {
				//if there's only on session in the Course
				//open the session directly
				//no need to see the course introduction
				openSession(data.content[0].sessions[0].id, data.content[0].sessions[0].title);
			}
		},
			// handle error
			function () {
				document.getElementById('n-course-intro-inner').innerHTML = '<div class="n-loading">加载失败，可能是我们的服务器不给力，也可能是您的网络不给力。</div>';
			}
		);

		// update the url to display 
		if (historyAPI() === true) {
			var k = window.location.href;
			if (k.indexOf('course=')>=0) {
				k = k.replace(/course=[^&]+/g,'course='+id);
				window.history.pushState(null, null, k);
			} else {
	        	window.history.pushState(null, null, gAppRoot + '&course=' + id);
	    	}
		}
	}

	function openSession(sessionId, sessionTitle) {
		var id = sessionId.replace(/^.*\/course\//g, '');
		var apiUrl = 'api/courses/course' + courseStatus.courseId + '/session' + id + '.json';
		courseStatus.page = 'session';
		gSlideScrollers = []; //Clear all in-slide scrollers
		document.getElementById('n-course-inner').innerHTML = '<div class="spinner"><div class="dot1"></div><div class="dot2"></div></div>';
		if (sessionTitle !== undefined) {
			document.getElementById('n-header-title').innerHTML = sessionTitle;
		}
		courseStatus.currentSession = id;
		document.getElementById('n-course-button').innerHTML = getCaption('start');
		document.body.className = 'n-in-course';
		getAPI(
			apiUrl, 
			function(data) {
				var courseHTML = '';
				var progressHTML = '';
				var courseImage = '';
				var courseUrl = 'api/courses/course' + data.course + '/index.json';
				//initialize courseStatus
				courseStatus.len = 0;
				courseStatus.score = 0;
				courseStatus.lostScore = 0;
				courseStatus.fullScore = 0;
				courseStatus.allPoints = [];
				courseStatus.courseId = data.course;
				document.getElementById('n-header-title').innerHTML = data.title;
				if (data.image && data.image !== '') {
					courseImage = '<div class="n-page-image-container"><div class="n-page-image-inner" style="background-image: url(' + data.image + ')"></div></div>';
				}
				if (data.passMark && data.passMark !== '') {
					courseStatus.passMark = parseInt(data.passMark, 10) || 60; 
				}
				courseHTML = '<div class="n-page n-page-start n-page-on"><div class="n-page-inner n-overflow-scroll-y"><div class="n-card-container n-overflow-scroll-y-inner"><div class="n-card-inner">' + courseImage + '<h1 class="n-page-title">' + data.title + '</h1><div class="n-page-lead">' + data.lead + '</div></div></div></div></div>';
				courseStatus.len += 1;
				$.each(data.content, function(entryIndex, entry) {
					var pageTitle = '';
					var pageMain = '';
					var pageOption = '';
					var pageOptions = [];
					var pageList = '';
					var pageValue = 0; 
					var pagePoint = '';
					var pageExplain = '';
					var pageImage = '';
					var isTrue = '';
					var isFalse = '';
					var listLength = 0;
					var quizNote;
					var quizMultipleClass = '';
					var isMultiple = false;
					var inputType = '';
					pageExplain = entry.explain || '';
					//if (pageExplain !== '') {
						pageExplain = '<div class="n-page-explain animated running fadeInUp"><div class="n-page-explain-header"><div class="n-page-explain-close"></div><div class="n-page-explain-header-text"></div></div><div class="n-page-explain-text">' + pageExplain + '</div></div>';
					//}
					pagePoint = entry.point || '';
					if (pagePoint !== '') {
						pagePoint = '<div class="n-page-point">' + pagePoint + '</div>';
					}
					if (entry.pageType === 'quiz') {
					// create single choice quiz and multiple choice quiz
						if (typeof entry.rightanswer === 'object') {
							isMultiple = true;
						}
						quizNote = (isMultiple === true) ? '多选：': '';
						quizMultipleClass = (isMultiple === true) ? ' is-multiple': '';
						pageTitle = '<h3 class="n-page-title">' + quizNote + entry.title + '</h3>';
						pageMain = '<div class="n-page-lead">' + entry.question + '</div>'; 
						pageValue = parseInt(entry.value, 10) || 1;

						if (isMultiple === true) {
							$.each(entry.rightanswer, function(itemIndex, item) {
								pageOptions.push ('<div class="n-option' + quizMultipleClass + '" value=' + pageValue + '>' + item + '</div>');
							});
						} else {
							pageOptions.push('<div class="n-option" value=' + pageValue + '>' + entry.rightanswer + '</div>');
						}

						$.each(entry.wronganswer, function(itemIndex, item) {
							pageOptions.push ('<div class="n-option' + quizMultipleClass + '">' + item + '</div>');
						});
						if (entry.randomize !== false) {
							pageOptions = shuffleArray(pageOptions);
						}
						$.each(pageOptions, function(itemIndex, item) {
							pageOption += item;
						});
						pageOption = '<div class="n-option-container">' + pageOption + '</div>'; 
						courseHTML += '<div class="n-page n-page-quiz"><div class="n-page-inner n-overflow-scroll-y"><div class="n-overflow-scroll-y-inner">' + pageTitle + pageMain + pageOption + pagePoint + pageExplain + '</div></div></div>';
					} else if (entry.pageType === 'trueOrFalse') {
						isTrue = '';
						isFalse = '';
						pageValue = parseInt(entry.value, 10) || 1;
						if (entry.rightanswer === true) {
							isTrue = ' value=' + pageValue;
						} else {
							isFalse = ' value=' + pageValue;
						}
						pageTitle = '<h3 class="n-page-title">' + getCaption('trueOrFalse') + '</h3>';
						pageMain = '<div class="n-page-lead">' + entry.question + '</div>'; 
						pageOption = '<div class="n-true"' + isTrue + '>' + getCaption('trueStatement') + '</div><div class="n-false"' + isFalse + '>' + getCaption('falseStatement') + '</div>';
						pageOption = '<div class="n-true-false-container">' + pageOption + '</div>'; 
						courseHTML += '<div class="n-page n-page-true-false"><div class="n-page-inner"><div class="n-card-container"><div class="n-card-inner">' + pageTitle + pageMain + pageOption + pagePoint + pageExplain + '</div></div></div></div>';
					} else if (entry.pageType === 'list') {
						pageTitle = '<h3 class="n-page-title">' + entry.title + '</h3>';
						pageMain = '<div class="n-page-lead">' + entry.text + '</div>';
						pageList = '';
						listLength = entry.list.length;
						//console.log (listLength);
						$.each(entry.list, function(itemIndex, item) {
							pageList += '<div class="n-list"><div class="n-list-title">' + item.title + '</div><div class="n-list-text-container animated running fadeIn"><div class="n-list-text-inner">' + item.text + '</div></div></div>';
						});
						pageList = '<div class="n-list-container">' + pageList + '</div>';
						courseHTML += '<div class="n-page"><div class="n-page-inner n-overflow-scroll-y n-overflow-scroll-force"><div class="n-overflow-scroll-y-inner">' + pageTitle + pageMain + pageList + '</div></div></div>';
					} else if (entry.pageType === 'image-text') {
						pageTitle = '<h3 class="n-page-title">' + entry.title + '</h3>';
						pageMain = '<div class="n-page-lead">' + entry.text + '</div>';
						if (entry.image && entry.image !== '') {
							pageImage = '<div class="n-home-course-container"><div class="n-home-course-inner" style="background-image: url(' + entry.image + ')"></div></div>';
						} 
						courseHTML += '<div class="n-page"><div class="n-page-inner n-overflow-scroll-y"><div class="n-card-container n-overflow-scroll-y-inner"><div class="n-card-inner">' + pageImage + pageTitle + pageMain + '</div></div></div></div>';
					} else if (entry.pageType === 'input') {
						pageTitle = '<h3 class="n-page-title">' + entry.title + '</h3>';
						pageMain = '<div class="n-page-lead">' + entry.question + '</div>';
						pageValue = parseInt(entry.value, 10) || 1;
						inputType = entry.inputType || 'text';
						pageOption = '<div class="n-input-container"><input class="n-input" type="' + inputType + '" answer="'+ entry.rightanswer +'" score="'+ entry.value +'"></div>';
						courseHTML += '<div class="n-page n-page-input"><div class="n-page-inner n-overflow-scroll-y"><div class="n-card-container n-overflow-scroll-y-inner"><div class="n-card-inner">' + pageTitle + pageMain + pageOption + pagePoint + pageExplain + '</div></div></div></div>';
					}
					courseStatus.fullScore += pageValue;
					courseStatus.len += 1;
					// course progress bar
					progressHTML += '<div class="n-progress" pageNum=' + entryIndex + '></div>';
				});
				courseHTML += '<div class="n-page n-page-last"><div class="n-page-inner n-overflow-scroll-y"><div class="n-overflow-scroll-y-inner"><h3 class="n-page-title"></h3><div class="n-page-lead"></div></div></div></div>';
				progressHTML += '<div class="n-progress" pageNum=' + (courseStatus.len -1) + '></div>';
				courseStatus.len += 1;
				document.getElementById('n-course-inner').innerHTML = courseHTML;
				document.getElementById('n-progress-inner').innerHTML = progressHTML;
				document.getElementById('n-header__score').innerHTML = '0/'+courseStatus.fullScore;
				openPage(0);
				// if the session courseID doesn't match the current courseID
				// load it from url
				// otherwise use data in the memory
				if (courseStatus.courseIntro.courseId === data.course) {
					getNextSession(courseStatus.courseIntro, id);
				} else {
					getAPI(
						courseUrl, 
						function(data) {
							getNextSession(data, id);
						},
						function() {
							document.getElementById('n-course-inner').innerHTML = '<div class="n-loading">加载失败，可能是我们的服务器不给力，也可能是您的网络不给力。</div>';
						}
					);
				}
			},
			function () { // handle error
				document.getElementById('n-course-inner').innerHTML = '<div class="n-loading">加载失败，可能是我们的服务器不给力，也可能是您的网络不给力。</div>';
			}
		);

		// update the url to display 
		if (historyAPI() === true) {
			var k = window.location.href;
			if (k.indexOf('session=')>=0) {
				k = k.replace(/session=[^&]+/g,'session='+sessionId);
				window.history.pushState(null, null, k);
			} else {
	        	window.history.pushState(null, null, gAppRoot + '&course=' + courseStatus.courseId + '&session=' + sessionId);
	    	}
		}
	}

	function getNextSession (data, id) {
		var index = 0;
		var currentSessionIndex;
		var nextSessionIndex;
		var sessionsList = [];
		courseStatus.courseTitle = data.title;
		$.each(data.content, function(chapterIndex, chapter){
			$.each(chapter.sessions, function(sessionIndex, session){
				if (session.id === id) {
					currentSessionIndex = index;
				}
				sessionsList.push(session);
				index += 1;
			});
		});
		if (currentSessionIndex < index -1) {
			nextSessionIndex = currentSessionIndex + 1;
			courseStatus.nextSession = sessionsList[nextSessionIndex].id;
		} else {
			courseStatus.nextSession = '';
		}
	}

	function expandList(ele) {
		ele.parent().addClass('done');
		ele.parent().parent().find('.n-list').removeClass('on');
		ele.parent().addClass('on');
		//add a space to force FTScroller updateonchanges
		ele.append(' ');
	}

	function courseAction(action) {
		if (courseStatus.buttonDisable === true) {
			return;
		}
		var isCorrect;
		var currentPage = $('.n-page').eq(courseStatus.current);
		var allOptions;
		var currentOptions;
		var currentOption;
		var currentValue;
		var currentPoint = '';
		var batteryLevel = 0;
		var lostScore = 0;
		var explainHeader = '';
		if (action === 'next') {
			courseStatus.current = parseInt(courseStatus.current, 10) || 0;
			if (courseStatus.current === courseStatus.len -1) {
			//last page
				courseStatus.current = 0;
			} else if (courseStatus.current < courseStatus.len -1) {
				courseStatus.current += 1; 
			}
			openPage(courseStatus.current);
		} else if (action === 'confirm') {
			// when user clicks confirm to check the answer
			allOptions = currentPage.find('.n-option, .n-input');
			currentOptions = currentPage.find('.n-option.selected,.n-true.selected,.n-false.selected');
			currentOption = currentOptions.eq(0);
			currentValue = currentOption.attr('value') || allOptions.attr('score')
			currentValue = parseInt(currentValue, 10) || 0;
			currentPoint = currentPage.find('.n-page-point').html() || '';
			if (currentOption.hasClass('is-multiple')) {
				// each option of multiple choices need to be validated
				allOptions.each(function(){
					// if isCorrect is already set to false, return immediately
					if ($(this).attr('value')>=1) {
						$(this).addClass('is-correct animated running tada');
					} else if ($(this).hasClass('selected')) {
						$(this).addClass('is-wrong animated running shake');
					}
					if (isCorrect === false) {
						return;
					}
					if (($(this).hasClass('selected') && $(this).attr('value')>=1) || (!$(this).hasClass('selected') && !$(this).attr('value'))) {
						isCorrect = true;
					} else {
						isCorrect = false;
					}
				});
			} else if (allOptions.hasClass('n-input')) {
				isCorrect = (allOptions.attr('answer') === allOptions.val())? true: false;
			} else {
				if (currentOption.attr('value') >= 1) {
					isCorrect = true;
				} else {
					isCorrect = false;
				}
			}
			if (isCorrect === true) {
				courseStatus.score += currentValue; 
				explainHeader = getCaption('correct') + ' +' + currentValue;
				if (allOptions.hasClass('n-input')) {
					allOptions.addClass('is-correct animated running tada');
				} else {
					currentOptions.addClass('is-correct animated running tada');
				}
				if (currentPoint !== '') {
					courseStatus.allPoints.push(
						{
							'point': currentPoint,
							'right': true,
							'page': courseStatus.current
						}
					);
				}
				playNativeSoundEffect('correct');
			} else {
				explainHeader = getCaption('wrong');
				currentPage.find('.n-page-explain-header').addClass('is-wrong');
				if (!currentOption.hasClass('is-multiple')) {
					lostScore = currentPage.find('.n-option[value],.n-true[value],.n-false[value]').attr('value') || currentPage.find('.n-input[score]').attr('score');
				} else {
					lostScore = currentPage.find('.n-option[value]').eq(0).attr('value');
				}
				lostScore = parseInt(lostScore, 10) || 0;
				courseStatus.lostScore += lostScore;
				if (allOptions.hasClass('n-input')) {
					allOptions.addClass('is-wrong animated running shake');
				} else if (!currentOption.hasClass('is-multiple')) {
				currentOption.addClass('is-wrong animated running shake');
					currentPage.find('.n-option[value],.n-true[value],.n-false[value]').addClass('is-correct');
				}
				if (currentPoint !== '') {
					courseStatus.allPoints.push(
						{
							'point': currentPoint,
							'right': false,
							'page': courseStatus.current
						}
					);
				}
				playNativeSoundEffect('wrong');
				// reduce battery for wrong answer
				// console.log (courseStatus.lostScore + '/' + courseStatus.fullScore);
				//batteryLevel = (100 * 100 * courseStatus.lostScore)/(courseStatus.fullScore * (100 - courseStatus.passMark));
				// batteryLevel = 100 * (courseStatus.fullScore - courseStatus.lostScore) / courseStatus.fullScore;
				// console.log (batteryLevel);
				// if (batteryLevel > 100) {
				// 	$('#n-battery-inner').height('100%');
				// 	$('#n-battery-container').addClass('failed');
				// } else {
				// 	$('#n-battery-inner').height(batteryLevel + '%');
				// 	if (batteryLevel > 60) {
				// 		$('#n-battery-container').addClass('alert');
				// 	}
				// }
				//$('#n-battery-container').addClass('used');
			}
			currentPage.addClass('done');
			courseStatus.action = 'next';
			document.getElementById('n-course-button').innerHTML = getCaption('next');
			currentPage.find('.n-page-explain-header-text').html(explainHeader);
			document.getElementById('n-header__score').innerHTML = courseStatus.score + '/' + courseStatus.fullScore;
		} else if (action === 'nextSession') {
			if (courseStatus.nextSession !== '') {
				openSession(courseStatus.nextSession);
			} else {
				backButton();
			}
		} else if (action === 'retry') {
			openSession(courseStatus.currentSession);
		}
	}

	// back function
	$('body').on('click', '.n-header__back', function(){
		backButton();
	});

	// close function
	$('body').on('click', '.n-header__close', function(){
		closeButton();
	});

	// click into a course
	$('body').on('click', '.n-course-link', function(){
		// open the course intro 
		// to see chapter and session list
		// 在宽屏上，将课程内容列表展示在边栏
		// 在窄屏上，先展示列表，然后点击进入第一课
		// 如果一门课程只有一个Session，应该直接进入，回退也直接退回上级菜单
		// openSession(this.href, this.title);
		openCourse(this.getAttribute('course-id'), this.title);
		return false;
	});

	// click into a session
	$('body').on('click', '.n-session-title', function(){
		openSession(this.getAttribute('session-id'), this.innerHTML);
		return false;
	});

	$('body').on('click', '#n-course-button', function(){
		courseAction(courseStatus.action);
	});

	$('body').on('click', '.n-option, .n-true, .n-false', function(){
		if ($(this).parentsUntil('n-page').parent().hasClass('done') === true) {
			return;
		}
		if ($(this).hasClass('is-multiple')) {
			$(this).toggleClass('selected');
		} else {
			$(this).parent().find('.n-option,.n-true, .n-false').removeClass('selected');
			$(this).addClass('selected');
		}
		var courseButton = $('#n-course-button');
		courseButton.html(getCaption('confirm'));
		courseButton.removeClass('disabled');
		courseStatus.action = 'confirm';
		courseStatus.buttonDisable = false;
	});

	$('body').on('change, keyup', '.n-input', function() {
		if ($(this).parentsUntil('n-page').parent().hasClass('done') === true) {
			return;
		}
		var courseButton = $('#n-course-button');
		courseButton.html(getCaption('confirm'));
		courseButton.removeClass('disabled');
		courseStatus.action = 'confirm';
		courseStatus.buttonDisable = false;
	});

	$('body').on('click', '.n-list-title', function(){
		expandList($(this));
	});

	$('body').on('click', '.n-point[page]', function(){
		openPage($(this).attr('page'));
	});

	$('body').on('click', '.n-page-explain-close', function(e){
		$(this).parentsUntil('.n-page-explain').parent().removeClass('fadeInUp').addClass('fadeOutDown');
		$(this).parentsUntil('.n-page').parent().addClass('explain-hidden');
		e.stopPropagation();
	});


	$('body').on('click', '.explain-hidden', function(){
		$(this).find('.n-page-explain').removeClass('fadeOutDown').addClass('fadeInUp');
		$(this).removeClass('explain-hidden');
	});

	//开发时允许点击进度条进入未做过的页面
	$('body').on('click', '.n-progress, .n-progress.done', function(){
		var pageNum = $(this).attr('pageNum');
		pageNum = parseInt(pageNum, 10);
		openPage(pageNum);
	});

	//点击顶部横条滚动到顶部需要原生程序配合
	//目前，先设定为点击顶部标题滚动到顶部
	$('body').on('click', '#n-header-title', function(e) {
		//document.getElementById('n-header-title').innerHTML = e.clientY;
		if (e.clientY >= 0 && e.clientY <= 100) {
			if (courseStatus.page === '') {
				//console.log (typeof scroller);
				gHomePageScroller.scrollTo(0,0,500);
			} else if (courseStatus.page === 'course') {
				gCourseIntroScroller.scrollTo(0,0,500);
			} else if (courseStatus.page === 'session') {
				//console.log (courseStatus.current);
				if (typeof gSlideScrollers[courseStatus.current] === 'object') {
					gSlideScrollers[courseStatus.current].scrollTo(0,0,500);
				}
			}
		}
	});

	// get JSON data for home page
    getAPI(
    	'api/index.json', 
	    function(data) {
	    	var startScreen = document.getElementById('start-screen'),
	    		homeContent = '';
	    	if (typeof data === 'object') {
		    	$.each(data, function(entryIndex, entry) {
		    		var bgClass;
		    		var innerClass;
		    		var sClass;
		    		var sMod;
		    		var mClass;
		    		var mMod;
		    		var lClass;
		    		var lMod;
		    		var containerClass;
		    		var clearFloat;
		    		bgClass = 'n-home-course-green';
		    		innerClass = 'n-home-course-inner ' + bgClass;
		    		sMod = entryIndex % 8;
		    		sClass = 's-' + sMod;
		    		mMod = entryIndex % 16;
		    		mClass = 'm-' + mMod;
		    		lMod = entryIndex % 16;
		    		lClass = 'l-' + lMod;
		    		containerClass = 'n-home-course-container ' + sClass + ' ' + mClass + ' ' + lClass;
		    		clearFloat = '<div class="clearfloat ' + sClass + ' ' + mClass + ' ' + lClass + '"></div>'; 
		    		homeContent += '<a course-id="course/' + entry.id + '" title="' + entry.title + '" class="n-course-link"><div class="' + containerClass + '"><div class="' + innerClass + '" /*style="background-image: url(' +  entry.image + '?'+ entry.id + ')"*/><div class="n-home-course-title">' + entry.title + '</div></div></div></a>' + clearFloat;
			        startScreen.className = 'start-screen fadeOut animated running';
		        });
				homeContent += '<div class="n-version">版本号：' + currentVersion + '</div>';
		        document.getElementById('home-content').innerHTML = homeContent;
				gHomePageScroller = new FTScroller(document.getElementById('home-content-scroller'), verticalScrollOpts);
		        setTimeout (function(){
		        	startScreen.parentNode.removeChild(startScreen);
		        },1000);

		        // quick link for a course or session
		        var courseIdInUrl = getpvalue(window.location.href, 'course');
		        if (courseIdInUrl !== '') {
		        	openCourse('course/' + courseIdInUrl, '');
		        	var sessionIdInUrl = getpvalue(window.location.href, 'session');
		        	if (sessionIdInUrl !== '') {
		        		openSession(sessionIdInUrl);
		        	}
		        }
	    	}
	    },
	    function() { // handle api request error
	    	var startScreen = document.getElementById('start-screen');
	    	startScreen.innerHTML = '<div class="start-screen-warning">网络连接失败</div>';
	    }
    );

	document.getElementById('n-header-title').innerHTML = getCaption('appTitle'); 
	document.getElementById('n-header__back').innerHTML = getCaption('back');

	//prevent default scrolling
	document.addEventListener('touchmove', function(event){
		event.preventDefault();
	});
})(); 