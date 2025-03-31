import { memo, useEffect } from "react";
import { useInView } from "react-intersection-observer";

export const ViewBottomTableComponent = memo(() => {
  const { ref, inView } = useInView({
    threshold: 1.0,
  });

  useEffect(() => {
    if (inView) {
      // Chame sua função aqui
    }
  }, [inView]);

  return (
    <tr ref={ref} style={{ opacity: 0 }}>
      <td className="text-center">Fim da Tabela</td>
    </tr>
  );
});
