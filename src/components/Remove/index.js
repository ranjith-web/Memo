import React from "react";
import { Tooltip } from "antd";

const Remove = ({
  title,
  dataTestId,
  className,
  listId,
  itemId,
  removeItem
}) => {
  return (
    <Tooltip title={title}>
      <span
        alt="Cancel"
        className={className}
        data-testid={dataTestId}
        onClick={() => removeItem(listId, itemId)}
      >
        &#x2573;
      </span>
    </Tooltip>
  );
};

export default Remove;
