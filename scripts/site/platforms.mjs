// Platform data and the shared install snippet. One snippet feeds every
// platform page, so they can't disagree about the code to paste.
import { SCRIPT_TAG } from './layout.mjs';

// Same default configuration as the demo playground (demo/demo.js), in
// the "Paste-only" variant, so the page snippet and the generator agree.
export const SNIPPET = `${SCRIPT_TAG}
<script>
(function () {
  function apply() {
    document.body.classList.add(
       "halloween",
       "halloween-screen-left-top",
       "halloween-screen-right-bottom",
       "halloween-eyes",
       "halloween-witches",
       "halloween-spider-drop",
       "halloween-tombstones"
    );
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
</script>`;

export const PLATFORMS = [
  {
    slug: 'wordpress',
    logo: 'wordpress',
    name: 'WordPress',
    also: 'WooCommerce',
    lead: 'A header and footer code plugin is the simplest way to add the script to any WordPress or WooCommerce site, with no theme files to edit. It works with classic and block themes alike.',
    steps: [
      'Install a plugin that injects code into the header or footer, for example WPCode, and activate it.',
      "Open the plugin's header and footer settings. In WPCode that is <strong>Code Snippets → Header &amp; Footer</strong>.",
      'Paste the snippet below into the <strong>Footer</strong> field and save.',
    ],
    notes: [
      "Prefer a child theme? Put the same snippet into a <code>wp_footer</code> hook in the child theme's <code>functions.php</code> instead of using a plugin.",
    ],
  },
  {
    slug: 'shopify',
    logo: 'shopify',
    name: 'Shopify',
    lead: "On Shopify the script goes into your theme's main layout file. Use the snippet below as it is: it adds the classes to the existing <code>&lt;body&gt;</code> tag instead of replacing it, so your theme's own body classes stay intact.",
    steps: [
      'In the admin open <strong>Online Store → Themes</strong>, then <strong>Edit code</strong> on your live theme.',
      'Open <strong>Layout → theme.liquid</strong>.',
      'Paste the snippet just above the closing <code>&lt;/body&gt;</code> tag and save.',
    ],
    notes: [
      'Duplicate the theme first if you want to test on an unpublished copy before the live one.',
    ],
  },
  {
    slug: 'webflow',
    logo: 'webflow',
    name: 'Webflow',
    lead: 'Webflow does not let you edit the <code>&lt;body&gt;</code> tag directly, so the snippet below adds the classes from a script. Custom code needs an active Site plan or a paid Workspace plan.',
    steps: [
      'Open <strong>Site settings → Custom code</strong>.',
      'Paste the snippet into <strong>Footer code</strong> (the end of <code>&lt;body&gt;</code>).',
      'Save, then publish the site. Custom code does not run in the Designer, only on the published site.',
    ],
    notes: [
      'To enable it on a single page, paste the snippet into <strong>Page settings → Custom code → Before &lt;/body&gt; tag</strong> of that page instead.',
    ],
  },
  {
    slug: 'squarespace',
    logo: 'squarespace',
    name: 'Squarespace',
    lead: 'Squarespace exposes code injection for the header and footer, but not the <code>&lt;body&gt;</code> tag. The snippet below adds the classes from a script.',
    steps: [
      'Open <strong>Code Injection</strong> in the site settings. It is listed under <strong>Settings → Advanced</strong>, and in some interface versions under <strong>Developer Tools</strong>.',
      'Paste the snippet into the <strong>Footer</strong> field.',
      'Save and reload your live site.',
    ],
    notes: [
      'Code injection is only available on plans that include it. Preview mode in the editor may not run injected code, so check the live site.',
    ],
  },
  {
    slug: 'wix',
    logo: 'wix',
    name: 'Wix',
    lead: 'Wix has a Custom Code section in the site settings. The <code>&lt;body&gt;</code> tag is not editable, so the snippet below adds the classes from a script. Wix only allows custom code on a published site with a connected domain.',
    steps: [
      'Open <strong>Settings → Advanced → Custom Code</strong> in your site dashboard.',
      'Click <strong>Add Custom Code</strong> and paste the snippet below.',
      'Name it (for example "Halloween"), set <strong>Add Code to Pages</strong> to <strong>All pages</strong> and <strong>Place Code in</strong> to <strong>Body - end</strong>.',
      'Apply, then publish the site.',
    ],
    notes: ['The Wix editor does not run custom code. Open the published site to see the effects.'],
  },
  {
    slug: 'tilda',
    logo: 'https://tilda.cc/favicon.ico',
    name: 'Tilda',
    lead: 'The quickest way on Tilda is a standard HTML block on the page. The <code>&lt;body&gt;</code> tag is not editable, so the snippet below adds the classes from a script.',
    steps: [
      'In the page editor open the block library, go to <strong>Other</strong> and add the <strong>T123</strong> block (Embed HTML Code).',
      'Paste the snippet below into the block and save.',
      'Publish the page. The block shows only as text in the editor and preview, so check the published page. Repeat for every page that should have the effects.',
    ],
    notes: [
      'For all pages at once, paste the same snippet into the HTML code for the head section under <strong>Site Settings → More</strong>, then republish all pages. Check that your Tilda plan includes custom code.',
    ],
  },
  {
    slug: 'ghost',
    logo: 'ghost',
    name: 'Ghost',
    lead: 'Ghost has site-wide code injection built in, so no theme edit is needed.',
    steps: [
      'Open <strong>Settings → Advanced → Code injection</strong> in Ghost Admin. Some versions list Code injection directly under Settings.',
      'Paste the snippet below into <strong>Site footer</strong>.',
      'Save and reload your site.',
    ],
    notes: [
      'Ghost outputs the Site footer field just before the closing <code>&lt;/body&gt;</code> tag on every page.',
    ],
  },
  {
    slug: 'blogger',
    logo: 'blogger',
    name: 'Blogger',
    lead: 'Blogger lets you edit the theme HTML directly, which is all you need.',
    steps: [
      'Open your blog, go to <strong>Theme</strong> and use the arrow next to <strong>Customize</strong> to choose <strong>Edit HTML</strong>.',
      'Find the closing <code>&lt;/body&gt;</code> tag near the end of the file.',
      'Paste the snippet just above it and click <strong>Save</strong>.',
    ],
    notes: ['Back up your theme first (Theme → Backup) before editing its HTML.'],
  },
  {
    slug: 'google-tag-manager',
    logo: 'googletagmanager',
    name: 'Google Tag Manager',
    lead: 'If the site already runs Google Tag Manager, you can switch the effects on and off from a tag without touching the site code.',
    steps: [
      'In your container open <strong>Tags → New</strong> and choose <strong>Custom HTML</strong> as the tag type.',
      'Paste the snippet below into the HTML field.',
      'Set the trigger to <strong>All Pages</strong>, name the tag, and save.',
      'Preview the container, then <strong>Submit</strong> and publish the new version.',
    ],
    notes: [
      'Pause the tag when the season ends if you want the effects off earlier than the built-in season window.',
    ],
  },
  {
    slug: 'framer',
    logo: 'framer',
    name: 'Framer',
    lead: 'Framer has a Custom Code section in the site settings. The snippet below adds the classes from a script. Custom code needs a paid Framer site plan.',
    steps: [
      'Open <strong>Site Settings</strong> and scroll to <strong>Custom Code</strong>.',
      'Paste the snippet into <strong>End of &lt;body&gt; tag</strong>.',
      'Save and publish the site.',
    ],
    notes: ['Custom code does not run in the Framer canvas. Check the published site.'],
  },
  {
    slug: 'html',
    logo: 'html5',
    name: 'HTML website',
    lead: 'On a hand-written or static-generated site you control the page source, so there are two equally valid ways to switch the effects on. The paste-only snippet is the simplest.',
    steps: [
      'Open the HTML file, or the shared layout or template that every page uses.',
      'Paste the snippet below just above the closing <code>&lt;/body&gt;</code> tag.',
      'Save, deploy, and reload the page.',
    ],
    notes: [
      'You can also put the classes straight on the tag, for example <code>&lt;body class="halloween halloween-eyes halloween-witches"&gt;</code>, and load the library with only the first line of the snippet (the <code>&lt;script src&gt;</code> tag). It can sit in <code>&lt;head&gt;</code> or at the end of <code>&lt;body&gt;</code>. See the <a href="/docs/getting-started/quick-start/">quick start</a>.',
      'Static site generators such as Eleventy, Hugo or Jekyll: put the snippet in the base layout so every page gets it.',
    ],
  },
  {
    slug: 'ai-assistant',
    logo: 'emoji:🤖',
    name: 'AI assistant',
    kind: 'prompt',
    lead: 'Ask your AI coding assistant to do the install. It reads a SKILL.md file that lists every class, option and gotcha of halloween.js, so it knows where to add the code and how to keep it working.',
    steps: [
      'Open your project in an AI coding assistant that can edit files and read web pages, such as Claude Code or Codex.',
      'Paste the prompt below.',
      'Review the change the assistant proposes and publish it as you normally would.',
    ],
    notes: [
      'No web access in your assistant? Download <a href="/SKILL.md">SKILL.md</a>, add it to the project, and tell the assistant to follow that file. In Claude Code you can save it as <code>.claude/skills/halloween/SKILL.md</code> to make it a skill.',
      'The prompt asks the assistant to leave the script in place. That is intentional: the season window turns the effects on and off by itself every year.',
    ],
  },
];

export const SEASON_NOTE = `<div class="callout">
        <strong>Install once, then leave it.</strong> The effects switch on by themselves every year from 18 October to 2 November and stay off the rest of the time. There is nothing to remove afterwards. Installed earlier? You will see nothing until 18 October. That is expected, not a bug.
      </div>`;

export const SKILL_PROMPT =
  'Add Halloween effects to this website using halloween.js. Follow the instructions at https://halloween.js.org/SKILL.md. Leave the script in the site after installing it: it switches itself on every year from 18 October to 2 November and off again.';
