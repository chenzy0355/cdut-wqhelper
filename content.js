(function() {
    // 1. 运行状态校验
    if (window.__wqt_running) {
        alert("任务执行中，请勿重复运行。");
        return;
    }
    window.__wqt_running = true;

    let originalTitle = document.title.replace(/回放\s*/g, '').trim() || "问渠学堂导出课件";

    // 2. 注入标准化的状态通知栏
    const banner = document.createElement('div');
    banner.style.cssText = "position:fixed; top:0; left:0; width:100%; background:#1890ff; color:#fff; text-align:center; padding:12px; font-size:16px; font-family: sans-serif; z-index:999999; box-shadow:0 2px 8px rgba(0,0,0,0.15); transition: background-color 0.3s;";
    document.body.appendChild(banner);

    // 封装一个更新通知栏的方法
    function updateBanner(text, bgColor = null) {
        if (bgColor) banner.style.background = bgColor;
        banner.innerHTML = text + "<button id='wqt-cancel' style='margin-left:20px; padding:4px 12px; cursor:pointer; color:#333; background:#fff; border:none; border-radius:4px;'>终止任务</button>";
        
        // 绑定取消按钮
        document.getElementById('wqt-cancel').onclick = function() {
            window.__wqt_running = false;
            document.removeEventListener('click', clickHandler, true);
            banner.remove();
        };
    }

    // 初始提示
    updateBanner("就绪：请找到【下一页 (>)】按钮并点击。为防止误触，需连续点击两次同一按钮以启动。");

    // 获取缓存的PPT链接
    function getPptUrls() {
        const allResources = window.performance.getEntriesByType("resource").map(r => r.name);
        let urls = allResources.filter(url => url.includes('/ppt/') && /\/(\d+)\.jpg$/.test(url));
        return [...new Set(urls)];
    }

    // 🎯 核心优化：双击确认防呆机制
    let pendingTarget = null; // 用于记录第一次点击的目标

    function clickHandler(e) {
        // 如果点的是我们自己的取消按钮，直接放行
        if (e.target.id === 'wqt-cancel') return;
        
        // 拦截页面的原生点击事件
        e.preventDefault();
        e.stopPropagation();
        
        if (!pendingTarget) {
            // 状态一：第一次点击
            pendingTarget = e.target;
            updateBanner("⚠️ 已锁定目标！请<b>再点击一次</b>该按钮以确认并启动。", "#faad14");
            
        } else if (pendingTarget === e.target) {
            // 状态二：第二次点击了同一个元素，验证通过！
            document.removeEventListener('click', clickHandler, true);
            startAutoClicker(e.target);
            
        } else {
            // 状态三：第二次点击了不同的元素，自动更新目标
            pendingTarget = e.target;
            updateBanner("🔄 目标已变更！请<b>再点击一次</b>当前按钮以确认启动。", "#faad14");
        }
    }

    // 在捕获阶段开启全局点击雷达
    document.addEventListener('click', clickHandler, true); 

    // 4. 自动连点器逻辑
    function startAutoClicker(nextBtn) {
        let currentCount = getPptUrls().length;
        let lastCount = currentCount;
        let idleTicks = 0;
        
        updateBanner(`正在后台静默缓存幻灯片，请稍候... (已缓存: ${currentCount} 页)`, "#faad14");

        function simulateClick(elem) {
            const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
            elem.dispatchEvent(evt);
        }

        const timer = setInterval(() => {
            simulateClick(nextBtn);
            
            currentCount = getPptUrls().length;
            if (currentCount > lastCount) {
                lastCount = currentCount;
                idleTicks = 0; 
                updateBanner(`正在后台静默缓存幻灯片，请稍候... (已缓存: ${currentCount} 页)`);
            } else {
                idleTicks++; 
            }
            
            if (idleTicks >= 20) {
                clearInterval(timer);
                banner.style.background = "#52c41a";
                banner.innerHTML = `✅ 缓存完成！共提取 ${currentCount} 页课件。<button id='wqt-open-preview' style='margin-left:20px; padding:6px 16px; cursor:pointer; color:#1890ff; background:#fff; font-weight:bold; border:none; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);'>在新标签页预览并导出</button>`;
                
                document.getElementById('wqt-open-preview').onclick = () => {
                    buildPdfPage(getPptUrls(), originalTitle);
                    window.__wqt_running = false;
                    banner.remove(); 
                };
            }
        }, 150);
    }

    // 5. 新标签页渲染逻辑
    function buildPdfPage(pptUrls, pageTitle) {
        pptUrls.sort((a, b) => {
            const timeA = parseInt((a.match(/\/(\d+)\.jpg$/) || [0,0])[1], 10);
            const timeB = parseInt((b.match(/\/(\d+)\.jpg$/) || [0,0])[1], 10);
            return timeA - timeB;
        });

        if (pptUrls.length === 0) {
            alert("提取异常：未检测到有效幻灯片图像。");
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("新标签页被浏览器拦截，请在地址栏右侧允许本站点的弹窗！");
            return;
        }

        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${pageTitle}</title>
                <style>
                    @page { size: 256mm 144mm; margin: 0; }
                    @media print {
                        body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
                        #wqt-print-btn { display: none !important; } 
                    }
                    body { margin: 0; padding: 0; background: #2b2b2b; font-family: sans-serif; }
                    .ppt-page { width: 100vw; height: 100vh; page-break-after: always; display: flex; justify-content: center; align-items: center; margin: 0; padding: 0; }
                    .ppt-page img { width: 100%; height: 100%; object-fit: cover; display: block; }
                    
                    #wqt-print-btn {
                        position: fixed; top: 20px; right: 30px; z-index: 99999; padding: 10px 24px;
                        font-size: 15px; color: white; background-color: #1890ff;
                        border: none; border-radius: 4px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                        transition: background-color 0.2s;
                    }
                    #wqt-print-btn:hover { background-color: #40a9ff; }
                </style>
            </head>
            <body>
                <button id="wqt-print-btn" onclick="window.print()">调用系统打印 (共 ${pptUrls.length} 页)</button>
        `;

        pptUrls.forEach(url => {
            htmlContent += `<div class="ppt-page"><img src="${url}" /></div>`;
        });

        htmlContent += `</body></html>`;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    }
})();