import React from 'react';
import App from 'next/app';
import Head from 'next/head';

export default class MyApp extends App {
  render(): JSX.Element {
    const { Component } = this.props;

    return (
      <>
        <Head>
            <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
            <title key="title">my default title</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        </Head>
        <Component />
      </>
    );
  }
}
