import { useEffect, useRef } from 'react';
import CountUp from 'react-countup';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
}

export default function AnimatedCounter({
    value,
    duration = 2,
    decimals = 0,
    prefix = '',
    suffix = ''
}: AnimatedCounterProps) {
    const prevValue = useRef(0);

    useEffect(() => {
        prevValue.current = value;
    }, [value]);

    return (
        <CountUp
            start={prevValue.current}
            end={value}
            duration={duration}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
            preserveValue
        />
    );
}
