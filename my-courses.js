(function() {
    
    
    
    

    if (window.__wqt_mycourses_running) return;
    window.__wqt_mycourses_running = true;

    
    var backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:999998;pointer-events:none;';

    var popup = document.createElement('div');
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:620px;max-width:95vw;max-height:80vh;background:#fff;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.25);z-index:999999;display:flex;flex-direction:column;font-family:"Microsoft YaHei","PingFang SC",sans-serif;font-size:14px;color:#333;overflow:hidden;';

    var titleBar = document.createElement('div');
    titleBar.style.cssText = 'padding:12px 18px;background:#1890ff;color:#fff;display:flex;justify-content:space-between;align-items:center;cursor:move;user-select:none;flex-shrink:0;border-radius:12px 12px 0 0;';
    titleBar.innerHTML = '<span style="font-size:16px;font-weight:bold;">📋 我的课程</span>' +
        '<button id="wqt-mc-close" style="width:28px;height:28px;border:none;background:rgba(255,255,255,0.2);color:#fff;border-radius:4px;cursor:pointer;font-size:16px;">✕</button>';

    var content = document.createElement('div');
    content.style.cssText = 'flex:1;overflow-y:auto;padding:14px 18px;min-height:120px;max-height:55vh;';

    var footer = document.createElement('div');
    footer.style.cssText = 'padding:10px 18px;border-top:1px solid #f0f0f0;display:flex;justify-content:flex-end;align-items:center;flex-shrink:0;';

    popup.appendChild(titleBar); popup.appendChild(content); popup.appendChild(footer);
    document.body.appendChild(backdrop); document.body.appendChild(popup);

    
    var isDragging = false, dx0, dy0, px0, py0;
    titleBar.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true; dx0 = e.clientX; dy0 = e.clientY;
        var r = popup.getBoundingClientRect(); px0 = r.left; py0 = r.top;
        popup.style.transition = 'none'; e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        popup.style.left = (px0 + e.clientX - dx0) + 'px';
        popup.style.top = (py0 + e.clientY - dy0) + 'px';
        popup.style.transform = 'none';
    });
    document.addEventListener('mouseup', function() { isDragging = false; popup.style.transition = ''; });

    document.getElementById('wqt-mc-close').onclick = function() {
        window.__wqt_mycourses_running = false;
        popup.remove(); backdrop.remove();
    };

    function escapeHtml(s) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    
    function extractFromCards(doc) {
        var courses = [];
        
        var cards = (doc || document).querySelectorAll('.course-item-wrapper, .courseInfo');
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var titleEl = card.querySelector('.course-title');
            var name = titleEl ? titleEl.textContent.trim() : '';
            var courseId = null;

            
            try {
                var vm = card.__vue__;
                if (vm) {
                    
                    courseId = tryExtractId(vm);
                    
                    if (!courseId && vm.$data) courseId = tryExtractId(vm.$data);
                    
                    if (!courseId && vm.$props) {
                        var propKeys = Object.keys(vm.$props);
                        for (var pk = 0; pk < propKeys.length && !courseId; pk++) {
                            var pv = vm.$props[propKeys[pk]];
                            if (pv && typeof pv === 'object') courseId = tryExtractId(pv);
                            if (typeof pv === 'number') courseId = pv;
                        }
                    }
                    
                    if (!courseId && vm.$parent) {
                        var pId = tryExtractId(vm.$parent);
                        if (pId) courseId = pId;
                        
                        if (!courseId && vm.$parent.$props) {
                            var ppKeys = Object.keys(vm.$parent.$props);
                            for (var ppk = 0; ppk < ppKeys.length && !courseId; ppk++) {
                                var ppv = vm.$parent.$props[ppKeys[ppk]];
                                if (Array.isArray(ppv) && ppv[i] && typeof ppv[i] === 'object') {
                                    courseId = tryExtractId(ppv[i]);
                                }
                            }
                        }
                    }
                }
                
                if (!courseId && card._vnode && card._vnode.component) {
                    courseId = tryExtractId(card._vnode.component);
                }
            } catch(e) {}

            if (name) courses.push({ name: name, course_id: courseId });
        }
        return courses;
    }

    function tryExtractId(obj) {
        if (!obj || typeof obj !== 'object') return null;
        
        if (obj.course_id) return obj.course_id;
        if (obj.courseId) return obj.courseId;
        
        var wrappers = ['item', 'row', 'course', 'data', 'info', 'courseInfo', 'courseData', 'origin'];
        for (var w = 0; w < wrappers.length; w++) {
            var wrap = obj[wrappers[w]];
            if (wrap && typeof wrap === 'object') {
                if (wrap.course_id) return wrap.course_id;
                if (wrap.courseId) return wrap.courseId;
                if (wrap.id) return wrap.id;
            }
        }
        
        if (obj.$props) {
            var pKeys = Object.keys(obj.$props);
            for (var pk = 0; pk < pKeys.length; pk++) {
                var pv = obj.$props[pKeys[pk]];
                if (pv && typeof pv === 'object' && (pv.course_id || pv.courseId)) return pv.course_id || pv.courseId;
                if (typeof pv === 'number' && pv > 1000) return pv;  
            }
        }
        
        if (obj._props) {
            var ppKeys = Object.keys(obj._props);
            for (var ppk = 0; ppk < ppKeys.length; ppk++) {
                var ppv = obj._props[ppKeys[ppk]];
                if (ppv && typeof ppv === 'object' && (ppv.course_id || ppv.courseId)) return ppv.course_id || ppv.courseId;
                if (typeof ppv === 'number' && ppv > 1000) return ppv;
            }
        }
        
        try {
            var ownKeys = Object.keys(obj);
            for (var ok = 0; ok < ownKeys.length; ok++) {
                var ov = obj[ownKeys[ok]];
                if (typeof ov === 'number' && ov > 1000 && ownKeys[ok].toLowerCase().indexOf('id') !== -1) return ov;
                if (ov && typeof ov === 'object' && ov.course_id) return ov.course_id;
            }
        } catch(e) {}
        
        if ((obj.course_name || obj.courseName) && obj.id) return obj.id;
        return null;
    }

    
    function findAllCards() {
        
        var docs = [document];
        var iframes = document.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {
            try {
                var d = iframes[i].contentDocument || iframes[i].contentWindow.document;
                if (d) docs.push(d);
            } catch(e) {}
        }
        var allCourses = [];
        for (var j = 0; j < docs.length; j++) {
            var courses = extractFromCards(docs[j]);
            for (var k = 0; k < courses.length; k++) { allCourses.push(courses[k]); }
        }
        return allCourses;
    }

    
    function extractCoursesFromObject(obj) {
        var courses = [];
        var seen = {};
        var visited = new WeakSet ? new WeakSet() : { _fake: true };

        function add(name, id) {
            if (!name || name.length < 2) return;
            var key = name + '|' + (id || '');
            if (!seen[key]) { seen[key] = true; courses.push({ name: name, course_id: id }); }
        }

        function extractId(item) {
            
            var idFields = ['course_id', 'courseId', 'id', 'cid', 'class_id', 'classId',
                'source_id', 'sourceId', 'resource_id', 'lesson_id', 'origin_id',
                'plan_id', 'training_id', 'tc_course_id', 'tronclass_id'];
            for (var f = 0; f < idFields.length; f++) {
                var v = item[idFields[f]];
                if (v !== undefined && v !== null && v !== '' && v !== 0 && typeof v !== 'object') {
                    return v;
                }
            }
            
            var wrappers = ['courseInfo', 'course', 'info', 'basicInfo', 'detail'];
            for (var w = 0; w < wrappers.length; w++) {
                var wrap = item[wrappers[w]];
                if (wrap && typeof wrap === 'object') {
                    for (var f2 = 0; f2 < idFields.length; f2++) {
                        var v2 = wrap[idFields[f2]];
                        if (v2 !== undefined && v2 !== null && v2 !== '' && v2 !== 0 && typeof v2 !== 'object') {
                            return v2;
                        }
                    }
                }
            }
            return null;
        }

        function extractName(item) {
            var nameFields = ['course_name', 'courseName', 'name', 'title', 'display_name',
                'full_name', 'className', 'course_title', 'coursename'];
            for (var f = 0; f < nameFields.length; f++) {
                var v = item[nameFields[f]];
                if (v && typeof v === 'string' && v.trim().length > 1) {
                    var name = v.trim();
                    
                    if (name.indexOf('el-') === 0) continue;      
                    if (name.indexOf('_') === 0) continue;         
                    if (/^[a-z]+-[a-z]+/.test(name) && name.length < 20) continue; 
                    if (/^[A-Z]/.test(name) && /[a-z]/.test(name) && name.length < 15 && name.indexOf(' ') === -1) continue; 
                    return name;
                }
            }
            return '';
        }

        function isCourseLike(item) {
            
            var courseFields = ['course_name', 'courseName', 'coursename',
                'study_time', 'studyTime', 'task_count', 'progress',
                'courseware_count', 'lesson_count', 'teacher_name', 'lecturer_name',
                'course_img', 'cover_img', 'course_status', 'sub_status',
                'course_type', 'type', 'room_name', 'learn_time'];
            for (var f = 0; f < courseFields.length; f++) {
                if (item[courseFields[f]] !== undefined && item[courseFields[f]] !== null) return true;
            }
            return false;
        }

        function walk(node, depth) {
            if (depth > 8 || !node || typeof node !== 'object') return;
            if (visited.add) {
                if (visited.has(node)) return;
                try { visited.add(node); } catch(e) { return; }
            }

            
            if (node === window.CONFIG) return;

            if (Array.isArray(node) && node.length > 0 && node.length < 500) {
                var first = node[0];
                if (first && typeof first === 'object' && isCourseLike(first)) {
                    for (var i = 0; i < node.length; i++) {
                        if (node[i] && typeof node[i] === 'object' && isCourseLike(node[i])) {
                            add(extractName(node[i]), extractId(node[i]));
                        }
                    }
                    return;
                }
            }

            var keys = Object.keys(node);
            for (var k = 0; k < keys.length; k++) {
                try {
                    var child = node[keys[k]];
                    
                    if (child === window.CONFIG) continue;
                    if (child && typeof child === 'object') walk(child, depth + 1);
                } catch(e) {}
            }
        }

        walk(obj, 0);
        return courses;
    }

    
    function tryApi(callback) {
        
        var origin = window.location.origin;
        var yjapi = 'https://yjapi.wqxt.cdut.edu.cn';
        var endpoints = [
            origin + '/courseapi/v3/multi-search/myCourse/list',
            origin + '/courseapi/v3/coursecard/my-course-list',
            origin + '/courseapi/v3/user/course-list',
            origin + '/courseapi/userapi/v1/my-course',
            origin + '/personal/courseapi/v3/multi-search/myCourse/list',
            yjapi + '/courseapi/v3/multi-search/myCourse/list',
            yjapi + '/courseapi/v3/coursecard/my-course-list'
        ];

        var tried = 0;
        function tryNext() {
            if (tried >= endpoints.length) {
                callback([]);
                return;
            }
            var url = endpoints[tried++];
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.withCredentials = true;
            xhr.timeout = 6000;
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        
                        window.__wqt_raw_response = data;

                        
                        var courses = extractCoursesFromObject(data);
                        if (courses.length > 0) {
                            callback(courses);
                            return;
                        }
                    } catch(e) { console.log('[WQT] API parse error:', e); }
                }
                tryNext();
            };
            xhr.onerror = function() { tryNext(); };
            xhr.ontimeout = function() { tryNext(); };
            xhr.send();
        }
        tryNext();
    }

    
    function buildHtml(courses) {
        var tenant = '21';
        var rows = '';
        for (var i = 0; i < courses.length; i++) {
            var c = courses[i];
            var idDisplay = c.course_id ? ('ID:' + c.course_id) : '未能获取ID';
            var href = c.course_id
                ? 'https://classroom.wqxt.cdut.edu.cn/coursedetail?course_id=' + c.course_id + '&tenant_code=' + tenant
                : '#';
            var btnStyle = c.course_id
                ? 'padding:5px 16px;cursor:pointer;color:#fff;background:#1890ff;border:none;border-radius:4px;font-size:13px;white-space:nowrap;'
                : 'padding:5px 16px;color:#bbb;background:#f5f5f5;border:1px solid #d9d9d9;border-radius:4px;font-size:13px;white-space:nowrap;';
            rows +=
                '<div style="display:flex;align-items:center;padding:9px 12px;border-bottom:1px solid #f5f5f5;gap:12px;">' +
                '<span style="flex:1;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escapeHtml(c.name) + '</span>' +
                '<span style="font-size:11px;color:' + (c.course_id ? '#999' : '#ff7875') + ';white-space:nowrap;">' + idDisplay + '</span>' +
                (c.course_id
                    ? '<a href="' + href + '" target="_blank" style="' + btnStyle + '">进入课程</a>'
                    : '<button disabled style="' + btnStyle + '">缺ID</button>') +
                '</div>';
        }
        return rows || '<div style="text-align:center;padding:30px;color:#999;">未找到课程</div>';
    }

    function showCourses(courses) {
        content.innerHTML =
            '<div style="font-weight:bold;margin-bottom:10px;">📚 共 ' + courses.length + ' 门课程</div>' +
            '<div style="font-size:12px;color:#999;margin-bottom:8px;">点击「进入课程」打开课程目录，然后用课件下载功能</div>' +
            buildHtml(courses);
        var hasId = courses.filter(function(c) { return !!c.course_id; }).length;
        footer.innerHTML =
            '<span style="flex:1;font-size:13px;color:#999;">有效: ' + hasId + '/' + courses.length + '</span>' +
            '<button onclick="document.getElementById(\'wqt-mc-close\').click()" style="padding:6px 16px;cursor:pointer;color:#666;background:#f5f5f5;border:1px solid #d9d9d9;border-radius:4px;">关闭</button>';
    }

    
    function main() {
        content.innerHTML = '<div style="text-align:center;padding:30px;color:#1890ff;">⏳ 正在提取课程列表...</div>';
        footer.innerHTML = '';

        
        setTimeout(function() {
            
            content.innerHTML = '<div style="text-align:center;padding:30px;color:#1890ff;">⏳ 解析课程列表...</div>';
            var domCourses = findAllCards();

            if (domCourses.length > 0 && domCourses.some(function(c) { return c.course_id; })) {
                
                showCourses(domCourses);
                return;
            }

            
            content.innerHTML = '<div style="text-align:center;padding:30px;color:#faad14;">⏳ 通过 API 获取课程...</div>';
            tryApi(function(apiCourses) {
                var courses = apiCourses.length > 0 ? apiCourses : domCourses;

                if (courses.length > 0) {
                    showCourses(courses);
                } else {
                    var eduLink = 'https://education.wqxt.cdut.edu.cn/?tenant_code=21';
                    content.innerHTML =
                        '<div style="text-align:center;padding:30px 20px;color:#666;">' +
                        '<div style="font-size:40px;margin-bottom:12px;">📋</div>' +
                        '<p style="font-size:15px;margin-bottom:16px;">当前页面未找到课程数据</p>' +
                        '<p style="font-size:13px;color:#999;margin-bottom:20px;">' +
                        '首页不直接显示课程列表</p>' +
                        '<a href="' + eduLink + '" target="_blank" style="display:block;margin:8px auto;padding:10px 20px;' +
                        'background:#1890ff;color:#fff;text-decoration:none;border-radius:6px;width:200px;">' +
                        '📚 进入我的学习</a></div>';
                    footer.innerHTML =
                        '<button onclick="document.getElementById(\'wqt-mc-close\').click()" ' +
                        'style="padding:6px 16px;cursor:pointer;color:#666;background:#f5f5f5;border:1px solid #d9d9d9;border-radius:4px;">关闭</button>';
                }
            });
        }, 1000);
    }

    
    window.__wqt_inspect = function() {
        var card = document.querySelector('.course-item-wrapper');
        if (!card) { console.log('未找到 .course-item-wrapper'); return; }
        var vm = card.__vue__;
        if (!vm) { console.log('card 上没有 __vue__'); return; }
        console.log('=== card.__vue__ 所有属性 ===');
        var keys = [];
        for (var k in vm) {
            try {
                var v = vm[k];
                var t = typeof v;
                if (t === 'object' && v !== null) keys.push(k + ': ' + t + ' {' + Object.keys(v).slice(0, 5).join(',') + '...}');
                else keys.push(k + ': ' + t + ' = ' + String(v).substring(0, 80));
            } catch(e) { keys.push(k + ': <error>'); }
        }
        console.log(keys.join('\n'));
        if (vm.$props) { console.log('$props keys:', Object.keys(vm.$props)); console.log('$props:', vm.$props); }
        if (vm.$data) { console.log('$data keys:', Object.keys(vm.$data)); }
        if (vm._props) { console.log('_props keys:', Object.keys(vm._props)); console.log('_props:', vm._props); }
        if (vm.$options && vm.$options.propsData) { console.log('propsData:', vm.$options.propsData); }
        console.log('=== raw response ===');
        console.log(window.__wqt_raw_response);
    };

    main();
})();
