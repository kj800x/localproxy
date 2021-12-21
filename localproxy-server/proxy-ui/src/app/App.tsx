import { FaInfinity, FaTools, FaTrash } from "react-icons/fa";
import { UIIcon } from "../util/UIIcon";
import { Route } from "./Route";
import { Tag } from "../util/Tag";
import styled from "styled-components";
import { UIInlineEditor } from "../util/UIInlineEditor";
import { FC } from "react";
import { AppType } from "./AppType";
import { useImmer } from "use-immer";
import { MdClose } from "react-icons/md";
import classNames from "classnames";

const AppWrapper = styled.div`
  border: 3px solid #5e6ab8;
  border-radius: 6px;
  margin: 12px 0;
  padding: 8px;
  background: #f0f1fa;

  &.draft {
    border: 3px dashed #5e6ab8;
  }

  h2 {
    color: #6a78d1 !important;
    padding-bottom: 2px;
    border-bottom: 1px solid #516f90;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
  }

  h2 > .icon {
    flex-shrink: 0;
  }

  h2 > a {
    color: #6a78d1;
    margin-right: 4px;
  }

  h2 > .app-icon {
    display: flex;
    flex: 1;
    justify-content: flex-end;
  }
`;

const RoutesGrid = styled.div`
  display: grid;

  grid-template-columns: auto auto auto 1fr auto auto;
  column-gap: 2px;
  row-gap: 4px;
  align-items: center;
  justify-content: center;

  .normal-tags {
    display: block;
  }

  .small-screen-tags {
    display: none;
  }

  @media screen and (max-width: 490px) {
    .normal-tags {
      display: none;
    }

    grid-template-columns: auto auto 1fr auto auto;

    .small-screen-tags {
      display: contents;
    }
  }
`;

interface AppProps {
  app: AppType;
  draft: boolean;
  editable: boolean;
  onUpdate: (app: AppType) => void;
  onDelete: (app: AppType) => void;
}

export const App: FC<AppProps> = ({
  app: initialApp,
  editable,
  draft,
  onUpdate,
  onDelete,
}) => {
  const [app, setApp] = useImmer<AppType>(initialApp);

  return (
    <AppWrapper className={classNames({ draft })}>
      <h2>
        <UIInlineEditor
          value={app.name}
          disabled={!editable}
          onChange={(value) =>
            setApp((app) => {
              app.name = value;
            })
          }
          placeholder="app-name"
        />
        <div className="app-icon">
          {app.pid && app.pid > -1 && (
            <Tag color="norman" style={{ marginTop: -2 }}>
              PID: {app.pid}
            </Tag>
          )}
          <UIIcon
            color="#6a78d1"
            iconColor={app.persist ? "#e5f5f8" : "#2d3e50"}
            title="This app will remain between restarts"
            Icon={FaInfinity}
            onClick={
              editable
                ? () => {
                    setApp((app) => {
                      app.persist = !app.persist;
                    });
                  }
                : undefined
            }
          />
          {app.system && (
            <UIIcon
              title="This app is essential for the localproxy system"
              iconColor="#e5f5f8"
              color="#00a38d"
              Icon={FaTools}
            />
          )}
          {editable && !app.system && (
            <UIIcon
              color="#d94c53"
              iconColor="#e5f5f8"
              Icon={draft ? MdClose : FaTrash}
              onClick={() => onDelete(app)}
            />
          )}
        </div>
      </h2>
      <RoutesGrid>
        {app.routes.map((route, i) => (
          <Route
            key={i}
            route={route}
            index={i}
            updateApp={setApp}
            editable={editable}
          />
        ))}
      </RoutesGrid>
    </AppWrapper>
  );
};
