/**
 * schema.org JSON-LD for an entity page.
 *
 * This is how a sports result reaches a rich result and an AI answer rather than just a blue link,
 * and robots.txt already names ClaudeBot, GPTBot and OAI-SearchBot explicitly.
 *
 * Rendered as a plain script tag from the server so it is in the first byte of html -- a crawler
 * that does not run javascript still sees it.
 */
const StructuredData = ({ data }: { data: object | null }) => {
  if (!data) {
    return null;
  }

  return (
    <script
      type = 'application/ld+json'
      // the payload is built from api rows in this app's own helpers, never from user input
      dangerouslySetInnerHTML = {{ __html: JSON.stringify(data) }}
    />
  );
};

export default StructuredData;
