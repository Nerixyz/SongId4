import React, { useEffect } from 'react';
import usePromise from 'react-promise';
import { useCountdownTimer } from 'use-countdown-timer';
import styled from 'styled-components';
import Identifier from './Identifier';

const BlueLink = styled.a`
	color: lightblue;
	text-decoration: underline;
`;

export default ({ rec }) => {
	const {value, loading, error} = usePromise(rec);
	const { countdown, start } = useCountdownTimer({
		timer: 1000 * 5,
	});

	useEffect(() => {
		start();
	}, []);

	return (
		loading ? (
			<span>{countdown / 1000}</span>
		) : (
			error ? (
				error.message === 'Security' ? (
					<span>
						Security error. Open media in its <BlueLink title={error.url} target="_blank" href={error.url}>own tab</BlueLink>.
					</span>
				) : (<span>Unknown error.</span>)
			) : (
				<Identifier blob={value} />
			)
		)
	)
};
