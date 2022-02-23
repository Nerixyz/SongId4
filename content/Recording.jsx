import React, { useState } from 'react';
import usePromise from 'react-promise';
import Countdown from 'react-countdown';
import styled from 'styled-components';
import Identifier from './Identifier';

const BlueLink = styled.a`
  color: lightblue;
  text-decoration: underline;
`;

const GoAgainButton = styled.button`
  color: white;
  background: darkslategray;
  border: 0;
  border-radius: 44px;
  align-self: center;
  cursor: pointer;
  height: 100%;
  :hover {
    background: cornflowerblue;
  }
`;

const Seconds = ({ seconds }) => <span>{seconds}</span>;

/**
 * @param {Promise<Blob>} promise
 * @param {(Blob) => JSX.Element} children
 * @param {JSX.Element} loader
 * @returns {JSX.Element}
 * @constructor
 */
const PromisesMade = ({ promise, children, loader }) => {
  const { value, loading, error } = usePromise(promise);
  return loading ? (
    loader
  ) : error ? (
    error.message === 'Security' ? (
      <span>
        Security error. Open media in its{' '}
        <BlueLink title={error.url} target="_blank" href={error.url}>
          own tab
        </BlueLink>
        .
      </span>
    ) : (
      <span>Unknown error.</span>
    )
  ) : (
    children(value)
  );
};

/**
 * @param {Promise<Blob>} rec
 * @param {(number) => Promise<Blob>} goAgain
 * @returns {JSX.Element}
 */
export default ({ rec, goAgain }) => {
  const [promise, setPromise] = useState(rec);
  const [time, setTime] = useState(5);

  return (
    <PromisesMade promise={promise} loader={<Countdown renderer={Seconds} date={Date.now() + time * 1000} />}>
      {value => (
        <Identifier blob={value}>
          <>
            <GoAgainButton
              type="button"
              onClick={async () => {
                /** @type {StorageState} */
                const settings = await browser.storage.sync.get();
                const t = parseInt(settings.extendedRecordLength) || 8;
                setTime(t);
                setPromise(goAgain(t));
              }}
            >
              Try again with more time
            </GoAgainButton>
          </>
        </Identifier>
      )}
    </PromisesMade>
  );
};
