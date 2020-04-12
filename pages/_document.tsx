import React from 'react';
// import Document, { Head, Main, NextScript, DocumentInitialProps } from 'next/document';
import Document, { Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

// MyDocument.getInitialProps = async (ctx): Promise<DocumentInitialProps> => {
//   const initialProps = await Document.getInitialProps(ctx);

//   return {
//     ...initialProps,
//   };
// };
