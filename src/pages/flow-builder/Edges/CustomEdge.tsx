import { Dispatch, JSX, SetStateAction } from "react";
import { GrFormClose } from "react-icons/gr";
import { RiScissorsCutLine } from "react-icons/ri";
import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "reactflow";

export const CustomEdge: React.FC<
  EdgeProps & {
    setEdges: Dispatch<SetStateAction<Edge<any>[]>>;
  }
> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  setEdges,
}): JSX.Element => {
  const [edgePath, _labelX, _labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: "#fff",
          strokeWidth: 2,
          fill: "none",
        }}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            background: "transparent",
            padding: 10,
            color: "#ff5050",
            fontSize: 12,
            fontWeight: 700,
            transform: `translate(30%, -50%) translate(${sourceX}px,${sourceY}px)`,
          }}
          className="nodrag nopan"
        >
          <button
            className="rounded-full border border-transparent bg-red-400 p-0.5 duration-300 hover:border-white hover:bg-red-500"
            style={{ zIndex: 999 }}
            onClick={(event) => {
              setEdges((edges) => edges.filter((ed) => ed.id !== id));
              event.stopPropagation();
            }}
          >
            <GrFormClose size={14} />
          </button>
        </div>
        <div
          style={{
            position: "absolute",
            background: "transparent",
            padding: 10,
            fontSize: 12,
            fontWeight: 700,
            transform: `translate(-90%, -50%) translate(${targetX}px,${targetY}px)`,
            zIndex: 999,
          }}
          className="nodrag nopan"
        >
          <button
            className="rounded-full border border-transparent bg-red-500 p-1 duration-300 hover:border-white hover:bg-red-600"
            style={{ zIndex: 999 }}
            onClick={(event) => {
              setEdges((edges) => edges.filter((ed) => ed.id !== id));
              event.stopPropagation();
            }}
          >
            <RiScissorsCutLine size={14} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
