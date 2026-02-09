(function () {
    chrome.storage.sync.get(['inspectorEnabled'], function (result) {
        if (result.inspectorEnabled === true) {
            initInspector();
        }
    });

    function initInspector() {
        let tooltip = null;
        let frozen = false;

        const style = document.createElement('style');
        style.textContent = `
            .dom-inspector-tooltip {
                position: fixed;
                z-index: 999999;
                background: #222;
                padding: 6px 10px;
                font-family: monospace;
                font-size: 12px;
                color: #fff;
            }
            .dom-inspector-tooltip.frozen {
                border: 1px solid #4CAF50;
            }
            .dom-inspector-item {
                cursor: pointer;
                padding: 2px 0;
            }
            .dom-inspector-item:hover {
                color: #4CAF50;
            }
            .dom-inspector-highlight {
                outline: 2px solid #4CAF50 !important;
            }
        `;
        document.head.appendChild(style);

        function getElementSignature(el) {
            return `&lt;${el.tagName.toLowerCase()}&gt;`;
        }

        function getAncestors(el) {
            const ancestors = [];
            let current = el;
            while (current && current !== document.body && current !== document.documentElement) {
                ancestors.push(current);
                current = current.parentElement;
            }
            return ancestors;
        }

        function updateTooltip(elements, x, y) {
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'dom-inspector-tooltip';
                document.body.appendChild(tooltip);
            }
            
            tooltip.innerHTML = '';
            
            elements.forEach((el) => {
                const item = document.createElement('div');
                item.className = 'dom-inspector-item';
                item.innerHTML = getElementSignature(el);
                
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(el.outerHTML);
                });
                
                item.addEventListener('mouseenter', () => {
                    el.classList.add('dom-inspector-highlight');
                });
                
                item.addEventListener('mouseleave', () => {
                    el.classList.remove('dom-inspector-highlight');
                });
                
                tooltip.appendChild(item);
            });

            tooltip.style.left = `${x + 15}px`;
            tooltip.style.top = `${y + 15}px`;
        }

        function removeTooltip() {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
            frozen = false;
            document.querySelectorAll('.dom-inspector-highlight').forEach(el => {
                el.classList.remove('dom-inspector-highlight');
            });
        }

        document.addEventListener('mousemove', (e) => {
            if (frozen) return;
            
            const target = e.target;
            if (target.closest('.dom-inspector-tooltip')) return;
            
            const ancestors = getAncestors(target);
            
            if (ancestors.length > 0) {
                updateTooltip(ancestors, e.clientX, e.clientY);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!frozen && tooltip) {
                    frozen = true;
                    tooltip.classList.add('frozen');
                } else {
                    removeTooltip();
                }
            }
        });
    }
})();