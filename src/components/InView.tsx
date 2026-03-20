import { useInView } from "react-intersection-observer";

interface IPropsInView {
  onChange(inView: boolean): void;
  className?: string;
}

export function InViewComponent(props: IPropsInView) {
  const { ref } = useInView({
    threshold: 0,
    onChange(inView) {
      props.onChange(inView);
    },
  });

  return <div ref={ref} className={props.className} />;
}
