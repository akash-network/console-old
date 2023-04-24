import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { visuallyHidden } from '@mui/utils';
import styled from '@emotion/styled';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import { Icon } from '../Icons';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import green from '@mui/material/colors/green';

interface Data {
  name: string;
  dseq: number;
  url: string;
  lease: string;
  status: number;
  updatable: number;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  alignRight: boolean;
}

interface DeploymentTableHeadProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  order: Order;
  orderBy: string;
}

interface DeploymentTableProps {
  rows: Array<{
    dseq: string | number;
    lease: string | number;
    status: string | number;
    name: string | number;
    url: string | number;
    updatable: string | number;
  }>;
  showAll: boolean;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells: readonly HeadCell[] = [
  {
    id: 'name',
    alignRight: false,
    disablePadding: false,
    label: 'NAME',
  },
  {
    id: 'dseq',
    alignRight: false,
    disablePadding: false,
    label: 'DSEQ',
  },
  {
    id: 'url',
    alignRight: false,
    disablePadding: false,
    label: 'URL',
  },
  {
    id: 'lease',
    alignRight: false,
    disablePadding: false,
    label: 'LEASE',
  },
  {
    id: 'status',
    alignRight: false,
    disablePadding: false,
    label: 'STATUS',
  },
  {
    id: 'updatable',
    alignRight: false,
    disablePadding: false,
    label: 'UPDATABLE',
  }
];

function DeploymentTableHead(props: DeploymentTableHeadProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead style={{ backgroundColor: '#F9FAFB' }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={order}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label === 'UPDATABLE'
                ? (<>
                  {headCell.label}
                  <Tooltip title="If the initial deployment was done using a different client (not console) it cannot be updated by Console." placement="bottom">
                    <InfoOutlinedIcon sx={{ color: '#666666', fontSize: '18px', ml: '4px' }} />
                  </Tooltip></>)
                : headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export const DeploymentTable: React.FC<DeploymentTableProps> = (props) => {
  const { rows, showAll } = props;
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('dseq');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const navigate = useNavigate();

  const handleRequestSort = (e: React.MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (e: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleNavigate = (to: string) => {
    navigate(to);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="deployment_table" size="medium">
            <DeploymentTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {rows
                .slice()
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  if (!showAll) {
                    // eslint-disable-next-line array-callback-return
                    if (row.status !== 1) return;
                  }

                  return (
                    <DeploymentTableRow
                      tabIndex={-1}
                      key={row.dseq}
                      onClick={() => handleNavigate(String(row.dseq))}
                    >
                      <DeploymentTableCellEllipsis>{row?.name}</DeploymentTableCellEllipsis>
                      <DeploymentTableCell id={`deployment_table_${index}`}>
                        <Tooltip title="View Details">
                          <DeploymentTableWithPointer>{row?.dseq}</DeploymentTableWithPointer>
                        </Tooltip>
                      </DeploymentTableCell>
                      <DeploymentTableCell>
                        {row?.url !== '' ? (
                          <DeploymentTableLinkButton href={`http://${row.url}`} target="_blank">
                            <span className="mr-2">
                              <Icon type="linkChain" />
                            </span>
                            <span className="overflow-hidden">{row.url}</span>
                          </DeploymentTableLinkButton>
                        ) : null}
                      </DeploymentTableCell>
                      <DeploymentTableCell>{row?.lease}</DeploymentTableCell>
                      <DeploymentTableCell>
                        {row?.status === 1 ? (
                          <DeploymentTableActive>Active</DeploymentTableActive>
                        ) : (
                          <DeploymentTableInActive>Inactive</DeploymentTableInActive>
                        )}
                      </DeploymentTableCell>
                      <DeploymentTableCell >
                        {row?.updatable ? (
                          <CheckCircleIcon sx={{ color: green[500] }} />
                        ) : (
                          ''
                        )}
                      </DeploymentTableCell>
                    </DeploymentTableRow>
                  );
                })}
              {emptyRows > 0 && (
                <DeploymentTableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </DeploymentTableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

const DeploymentTableRow = styled(TableRow)`
  position: relative;
  &:hover {
    background-color: #f3f4f6;
  }
`;

const DeploymentTableCell = styled(TableCell)`
  padding: 21.5px;
  cursor: pointer;
`;

const DeploymentTableCellEllipsis = styled(DeploymentTableCell)`
  padding: 21.5px;
  width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;

const DeploymentTableWithPointer = styled.p`
  font-family: 'Satoshi-Medium', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #fa5757;
  cursor: pointer;
`;

const DeploymentTableLinkButton = styled.a`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 17px 4px 15px;
  width: 190px;
  height: 28px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  white-space: nowrap;

  font-family: 'Satoshi-Regular', serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #6b7280;
`;

const DeploymentTableActive = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 10px;
  width: 54px;
  height: 20px;

  /* green/100 */
  background: #d1fae5;
  border-radius: 10px;

  font-family: 'Satoshi-Regular';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  text-align: center;

  /* green/800 */
  color: #065f46;
`;

const DeploymentTableInActive = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 10px;
  width: 64px;
  height: 20px;

  /* AKT red/100 */
  background: #fee2e2;
  border-radius: 10px;

  font-family: 'Satoshi-Regular';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  text-align: center;

  /* AKT red/800 */
  color: #991b1b;
`;
