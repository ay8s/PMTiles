import { useState, useEffect } from "react";
import { PMTiles } from "../../js";
import { styled } from "./stitches.config";

import Inspector from "./Inspector";
import MaplibreMap from "./MaplibreMap";

import { MagnifyingGlassIcon, ImageIcon } from "@radix-ui/react-icons";
import * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const StyledToolbar = styled(ToolbarPrimitive.Root, {
  display: "flex",
  height: "$4",
  width: "100%",
  boxSizing: "border-box",
  minWidth: "max-content",
  backgroundColor: "white",
  boxShadow: `0 2px 10px "black"`,
});

const itemStyles = {
  all: "unset",
  flex: "0 0 auto",
  color: "$black",
  display: "inline-flex",
  padding: "0 $1 0 $1",
  fontSize: "$2",
  alignItems: "center",
  "&:hover": { backgroundColor: "$hover", color: "$white" },
  "&:focus": { position: "relative", boxShadow: `0 0 0 2px blue` },
};

const StyledLink = styled(
  ToolbarPrimitive.Link,
  {
    ...itemStyles,
    backgroundColor: "transparent",
    color: "black",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
  },
  { "&:hover": { backgroundColor: "$hover", color:"$white", cursor: "pointer" } }
);

const StyledToggleGroup = styled(ToolbarPrimitive.ToggleGroup, {
  display: "inline-flex",
  borderRadius: 4,
});

const StyledToggleItem = styled(ToolbarPrimitive.ToggleItem, {
  ...itemStyles,
  boxShadow: 0,
  backgroundColor: "white",
  marginLeft: 2,
  cursor: "pointer",
  "&:first-child": { marginLeft: 0 },
  "&[data-state=on]": { backgroundColor: "$primary", color: "$primaryText" },
});

const MetadataButton = styled(DialogPrimitive.Trigger, {
  backgroundColor:"$primary",
  color:"$primaryText",
  padding:"$1",
  cursor: "pointer"
})

const StyledOverlay = styled(DialogPrimitive.Overlay, {
  backgroundColor: "black",
  position: "fixed",
  inset: 0,
  opacity: "40%",
  zIndex: 3,
});

const StyledContent = styled(DialogPrimitive.Content, {
  backgroundColor: "#222",
  padding:"$1",
  borderRadius: 6,
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  zIndex: 4,
  "&:focus": { outline: "none" },
});

const MetadataTable = styled("table", {
  tableLayout:"fixed",
  width:"100%"
});

const MetadataKey = styled("td", {
  padding: "0 $1"
});

const MetadataValue = styled("td", {
  fontFamily:"monospace",
});

const JsonValue = styled(MetadataValue, {
  overflowX:"scroll"
})

const Toolbar = StyledToolbar;
const ToolbarLink = StyledLink;
const ToolbarToggleGroup = StyledToggleGroup;
const ToolbarToggleItem = StyledToggleItem;

function Loader(props: { file: PMTiles }) {
  let [tab, setTab] = useState("maplibre");
  let [metadata, setMetadata] = useState<[string, string][]>([]);
  let [modalOpen, setModalOpen] = useState<boolean>(false);

  let view;
  if (tab === "maplibre") {
    view = <MaplibreMap file={props.file} />;
  } else {
    view = <Inspector file={props.file} />;
  }

  useEffect(() => {
    let pmtiles = props.file;
    const fetchData = async () => {
      let m = await pmtiles.getMetadata();
      let tmp: [string, string][] = [];
      for (var key in m) {
        tmp.push([key, m[key]]);
      }
      setMetadata(tmp);
    };
    fetchData();
  }, [props.file]);

  const metadataRows = metadata.map((d, i) => {
    let Cls = (d[0] === 'json') ? JsonValue : MetadataValue
    return <tr key={i}>
      <MetadataKey>{d[0]}</MetadataKey>
      <Cls>{d[1]}</Cls>
    </tr>
  });

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Toolbar aria-label="Formatting options">
        <ToolbarToggleGroup
          type="single"
          defaultValue="center"
          aria-label="Text alignment"
          value={tab}
          onValueChange={setTab}
        >
          <ToolbarToggleItem value="maplibre" aria-label="Right aligned">
            Map View
          </ToolbarToggleItem>
          <ToolbarToggleItem value="inspector" aria-label="Left aligned">
            <MagnifyingGlassIcon /> Tile Inspector
          </ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarLink href="#" target="_blank" css={{ marginRight: 10 }}>
          {props.file.source.getKey()}
        </ToolbarLink>
        <DialogPrimitive.Root open={modalOpen}>
          <MetadataButton onClick={() => setModalOpen(true)}>
            Metadata
          </MetadataButton>
          <DialogPrimitive.Portal>
            <StyledOverlay />
            <StyledContent
              onEscapeKeyDown={closeModal}
              onPointerDownOutside={closeModal}
            >
              <DialogPrimitive.Title />
              <DialogPrimitive.Description />
              <MetadataTable>
                <thead>
                  <tr>
                    <th>key</th>
                    <th>value</th>
                  </tr>
                </thead>
                <tbody>{metadataRows}</tbody>
              </MetadataTable>
              <DialogPrimitive.Close />
            </StyledContent>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </Toolbar>

      {view}
    </>
  );
}

export default Loader;
