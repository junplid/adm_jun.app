import { useEffect, useRef } from "react";
import dayjs from "dayjs";

type Callback = (formattedTime: string) => void;

export function useFiveMinuteClock(callback: Callback) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function scheduleNext() {
      const now = dayjs();

      const minutes = now.minute();
      const seconds = now.second();
      const milliseconds = now.millisecond();

      const minutesToNext = 5 - (minutes % 5);

      const delay = minutesToNext * 60 * 1000 - seconds * 1000 - milliseconds;

      timeoutRef.current = window.setTimeout(() => {
        const executionTime = dayjs().format("HH:mm");
        callback(executionTime);

        scheduleNext();
      }, delay);
    }

    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [callback]);
}
