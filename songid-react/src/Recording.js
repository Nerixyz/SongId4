import React, { useEffect, useState } from 'react';
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

const Seconds = ({ seconds }) => (
	<span>{seconds}</span>
);

const PromisesMade = ({ p, children, loader }) => {
	const { value, loading, error } = usePromise(p);
	return (
		loading ? loader : error ? (
				error.message === 'Security' ? (
					<span>
						Security error. Open media in its <BlueLink title={error.url} target="_blank" href={error.url}>own tab</BlueLink>.
					</span>
				) : (<span>Unknown error.</span>)
			) : children(value)
	);
}

export default ({ rec, goAgain }) => {
	const [key, setKey] = useState(0);
	const [p, setP] = useState(rec);

	const [time, setTime] = useState(5);

	const {value, loading, error} = usePromise(rec);

	return (
		<PromisesMade
			p={p}
			loader={<Countdown renderer={Seconds} date={Date.now() + (time * 1000)} />}
		>
			{value => (
				<Identifier blob={value}>
				<>
					<GoAgainButton
						type="button"
						onClick={async () => {
							const settings = await browser.storage.sync.get();
							const t = settings.len || 8;
							setTime(t);
							const pp = goAgain(t);
							setP(pp);
						}}
					>Try again with more time</GoAgainButton>
				</>
				</Identifier>
			)}
		</PromisesMade>
	);
};
