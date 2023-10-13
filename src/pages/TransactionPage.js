import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Card, Table, Stack, Paper, Avatar, Button, Popover, Checkbox, TableRow, MenuItem, TableBody, TableCell, Container, Typography, IconButton, TableContainer, TablePagination,
} from '@mui/material';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { fCurrency } from '../utils/formatNumber';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { TransactionListHead, TransactionListToolbar } from '../sections/@dashboard/transactions';
import { prod, dev } from "../utils/env";

// mock
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'exnessId', label: 'Exness ID', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'time', label: 'Time', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.amount.toString().toLowerCase().indexOf(query.toString().toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function TransactionPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [listTransactions, setListTransactions] = useState([]);

  const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
  const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");

  useEffect(() => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/secured/get-transaction/email=${currentEmail}`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };

    axios.request(config)
      .then((response) => {
        setListTransactions(response.data);
      })
      .catch((error) => {
        if (error.response.status === 403) {
          Swal.fire({
            title: "An error occured",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            title: "Session is ended, please login again !",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
          });
        }
      });

  }, []);

  const handleConvertTime = (timeunix) => {
    return format(new Date(timeunix * 1000), 'HH:mm:ss dd/MM/yyyy');
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - listTransactions.length) : 0;

  const filteredUsers = applySortFilter(listTransactions, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Transaction </title>
      </Helmet>

      <Container>
        <Card>
          <TransactionListToolbar filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TransactionListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={listTransactions.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, exnessId, amount, time, type } = row;

                    return (
                      <TableRow hover key={id} tabIndex={-1}>
                        <TableCell align="left">{exnessId}</TableCell>

                        <TableCell align="left">{fCurrency(amount)}</TableCell>

                        <TableCell align="left">{handleConvertTime(time)}</TableCell>

                        <TableCell align="left">{type}</TableCell>

                        <TableCell align="left">
                          <Label color={("success")}>{"success"}</Label>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={listTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}
