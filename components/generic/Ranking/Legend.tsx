'use client';


import CloseIcon from '@esmalley/react-material-icons/Close';
import TableColumns from '@/components/helpers/TableColumns';
import { IconButton, Modal, Typography, useTheme } from '@esmalley/react-material-ui';
import { useAppSelector } from '@/redux/hooks';

const Legend = ({ open, onClose, columns, view, organization_id }) => {
  const career = useAppSelector((state) => state.rankingReducer.career);
  const career_active = useAppSelector((state) => state.rankingReducer.career_active);
  const headers = TableColumns.getColumns({ organization_id, view, career: (career === 1 || career_active === 1) });
  const theme = useTheme();

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
      >
        <div style = {{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography type = 'h6'>Column legend</Typography>
          <IconButton value = 'close' onClick={onClose} icon = {<CloseIcon style = {{ fontSize: 24 }} />} />
        </div>
        <div>
          {
            columns.map((column: string) => {
              if (!(column in headers)) {
                return null;
              }
              return (
                <div key = {column} style = {{ display: 'flex', margin: '5px 0px' }}>
                  <Typography type = 'subtitle2' style = {{ color: theme.info.main }}>{headers[column].getLabel()}:</Typography>
                  <Typography style = {{ marginLeft: 10 }} type = 'body2'>{headers[column].getTooltip()}</Typography>
                </div>
              );
            })
          }
        </div>
      </Modal>
    </>
  );
};

export default Legend;
