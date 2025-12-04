import Script from 'next/script';

export default function SmartSuppChat() {
  return (
    <Script
      id="smartsupp"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var _smartsupp = _smartsupp || {};
          _smartsupp.key = 'YOUR_WIDGET_ID';
          _smartsupp.position = 'right';
          _smartsupp.offsetX = 20;
          _smartsupp.offsetY = 20;
          window.smartsupp||(function(d) {
            var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
            s=d.getElementsByTagName('script')[0];c=d.createElement('script');
            c.type='text/javascript';c.charset='utf-8';c.async=true;
            c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
          })(document);
        `
      }}
    />
  );
}
