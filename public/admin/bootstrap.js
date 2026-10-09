/* Decap manages the authenticated editing session. No client secret is sent here. */
import { validateEntry, updatePublishedEntry } from './validation.js';
window.CMS_MANUAL_INIT = true;
(async function () {
  const status = document.getElementById('status');
  try {
    const demo = new URLSearchParams(window.location.search).get('demo') === '1';
    const response = await fetch('/api/admin/config' + (demo ? '?demo=1' : ''), { cache: 'no-store' });
    if (!response.ok) throw new Error('Cannot load CMS configuration');
    const settings = await response.json();
    if (!settings.configured && !settings.demo) {
      status.textContent = '等待首次授权配置';
      document.getElementById('callback-url').textContent = settings.config.backend.base_url + '/api/admin/callback';
      document.getElementById('setup').hidden = false;
      document.getElementById('demo-link').hidden = !settings.development;
      return;
    }
    if (settings.demo) {
      window.repoFiles = { content: settings.demoFiles };
      // The test backend's folder listing expects direct keys; file lookup uses a tree.
      settings.config.collections.filter(c => c.folder).forEach(c => {
        window.repoFiles[c.folder] = c.folder.split('/').reduce((node, part) => node?.[part], window.repoFiles) || {};
      });
    }
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/admin/vendor/decap-cms-3.15.1.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    window.CMS.registerPreviewStyle('/admin/preview.css');
    ['preSave', 'prePublish'].forEach(name => window.CMS.registerEventListener({
      name,
      handler: ({ entry }) => validateEntry(entry.toJS(), settings.validation, name === 'prePublish'),
    }));
    ['postPublish', 'postUnpublish'].forEach(name => window.CMS.registerEventListener({
      name,
      handler: ({ entry }) => updatePublishedEntry(entry.toJS(), settings.validation, name === 'postUnpublish'),
    }));
    const React = window.h;
    function writingPreview(props) {
      const data = props.entry.get('data');
      return React('article', { className: 'writing-preview' },
        React('p', { className: 'preview-label' }, '枝海 · 阅读预览'),
        React('h1', {}, data.get('title')),
        data.get('excerpt') ? React('p', { className: 'preview-excerpt' }, data.get('excerpt')) : null,
        props.widgetFor('body'));
    }
    window.CMS.registerPreviewTemplate('blog', writingPreview);
    settings.config.collections.filter(c => c.name.startsWith('chapters-')).forEach(c => window.CMS.registerPreviewTemplate(c.name, writingPreview));
    window.CMS.init({ config: settings.config });
    document.getElementById('welcome').hidden = true;
    document.getElementById('demo-notice').hidden = !settings.demo;
  } catch {
    status.textContent = '暂时无法打开内容后台';
    document.getElementById('load-error').hidden = false;
  }
})();
