import { Fragment as FragmentRow, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatTanggal } from "@/lib/format";
import type { Sumber, Seksi, Trx } from "@/lib/admin-types";
import { StatusBadge } from "./StatusBadge";
import { TransaksiDialog } from "./TransaksiDialog";

interface Props {
  sumber: Sumber[];
  seksi: Seksi[];
  trx: Trx[];
  onChanged: () => void;
}

export function AdminMasuk({ sumber, seksi, trx, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Trx | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(
    () => trx.filter((t) => t.tipe === "pemasukan").sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [trx],
  );

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Donasi Masuk</h2>
          <p className="text-sm text-muted-foreground">Daftar donasi per donatur</p>
        </div>
        <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> Tambah
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const isOpen = expanded === r.id;
              const sumberNama = sumber.find((s) => s.id === r.sumber_donasi_id)?.nama;
              return (
                <FragmentRow key={r.id}>
                  <TableRow className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : r.id)}>
                    <TableCell className="whitespace-nowrap">{formatTanggal(r.tanggal)}</TableCell>
                    <TableCell className="font-medium">{r.donor_nama ?? "-"}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatRupiah(r.nominal)}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell>{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={5}>
                        <div className="grid grid-cols-2 gap-4 p-2 text-sm">
                          <div className="space-y-1">
                            <div><span className="text-muted-foreground">Kode: </span>{r.kode ?? "-"}</div>
                            <div><span className="text-muted-foreground">Nama: </span>{r.donor_nama ?? "-"}</div>
                            <div><span className="text-muted-foreground">Sumber: </span>{sumberNama ?? "-"}</div>
                            <div><span className="text-muted-foreground">Nominal: </span><b>{formatRupiah(r.nominal)}</b></div>
                            <div><span className="text-muted-foreground">Tanggal: </span>{formatTanggal(r.tanggal)}</div>
                            <div className="flex items-center gap-2"><span className="text-muted-foreground">Status: </span><StatusBadge status={r.status} /></div>
                            <div><span className="text-muted-foreground">Keterangan: </span>{r.keterangan ?? "-"}</div>
                          </div>
                          <div>
                            <div className="mb-1 text-muted-foreground">Bukti Bayar</div>
                            {r.bukti_bayar_url ? (
                              <a href={r.bukti_bayar_url} target="_blank" rel="noreferrer">
                                <img src={r.bukti_bayar_url} alt="bukti" className="h-32 w-24 rounded border object-cover" />
                              </a>
                            ) : (
                              <div className="flex h-32 w-24 items-center justify-center rounded border text-xs text-muted-foreground">
                                Tidak ada
                              </div>
                            )}
                            <Button size="sm" variant="outline" className="mt-2" onClick={(e) => { e.stopPropagation(); setEdit(r); setOpen(true); }}>
                              Edit
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </FragmentRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Belum ada donasi masuk</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TransaksiDialog open={open} onOpenChange={setOpen} initial={edit} defaultTipe="pemasukan" sumber={sumber} seksi={seksi} onSaved={onChanged} />
    </div>
  );
}
