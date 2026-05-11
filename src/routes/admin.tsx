import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — KHOLWAT MDTI 2026" }] }),
  component: AdminPage,
});

type Sumber = { id: string; nama: string };
type Seksi = { id: string; nama: string; rencana_anggaran: number };
type Trx = {
  id: string; tanggal: string; tipe: "pemasukan" | "pengeluaran"; nominal: number;
  keterangan: string | null; sumber_donasi_id: string | null; seksi_id: string | null;
};

function AdminPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [sumber, setSumber] = useState<Sumber[]>([]);
  const [seksi, setSeksi] = useState<Seksi[]>([]);
  const [trx, setTrx] = useState<Trx[]>([]);

  // form transaksi
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [tipe, setTipe] = useState<"pemasukan" | "pengeluaran">("pemasukan");
  const [sumberId, setSumberId] = useState("");
  const [seksiId, setSeksiId] = useState("");
  const [nominal, setNominal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/login" });
        return;
      }
      const uid = sess.session.user.id;
      setUserId(uid);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      setReady(true);
      await reload();
    })();
  }, []);

  const reload = async () => {
    const [s, k, t] = await Promise.all([
      supabase.from("sumber_donasi").select("id, nama").order("urutan"),
      supabase.from("seksi").select("id, nama, rencana_anggaran").order("urutan"),
      supabase.from("transaksi").select("*").order("tanggal", { ascending: false }).limit(100),
    ]);
    setSumber(s.data ?? []);
    setSeksi((k.data ?? []) as Seksi[]);
    setTrx((t.data ?? []) as Trx[]);
  };

  const claimAdmin = async () => {
    if (!userId) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) toast.error(error.message);
    else {
      toast.success("Anda sekarang admin");
      setIsAdmin(true);
    }
  };

  const addTrx = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      tanggal,
      tipe,
      nominal: Number(nominal),
      keterangan: keterangan || null,
      sumber_donasi_id: tipe === "pemasukan" ? sumberId || null : null,
      seksi_id: tipe === "pengeluaran" ? seksiId || null : null,
    };
    const { error } = await supabase.from("transaksi").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Transaksi ditambahkan");
    setNominal(""); setKeterangan("");
    await reload();
  };

  const delTrx = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    const { error } = await supabase.from("transaksi").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus");
    await reload();
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="p-10 text-center text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <h1 className="text-2xl font-bold">Panel Admin</h1>

        {!isAdmin && (
          <div className="rounded-2xl border border-dashed bg-card p-6 text-center">
            <p className="mb-3 text-muted-foreground">
              Akun Anda belum memiliki peran admin. Klik di bawah untuk klaim akses admin pertama kali.
            </p>
            <Button onClick={claimAdmin}>Klaim Akses Admin</Button>
          </div>
        )}

        {isAdmin && (
          <>
            <section className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Tambah Transaksi</h2>
              <form onSubmit={addTrx} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Tanggal</Label>
                  <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
                </div>
                <div>
                  <Label>Tipe</Label>
                  <Select value={tipe} onValueChange={(v) => setTipe(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pemasukan">Pemasukan</SelectItem>
                      <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {tipe === "pemasukan" ? (
                  <div className="md:col-span-2">
                    <Label>Sumber Donasi</Label>
                    <Select value={sumberId} onValueChange={setSumberId}>
                      <SelectTrigger><SelectValue placeholder="Pilih sumber" /></SelectTrigger>
                      <SelectContent>
                        {sumber.map((s) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <Label>Seksi</Label>
                    <Select value={seksiId} onValueChange={setSeksiId}>
                      <SelectTrigger><SelectValue placeholder="Pilih seksi" /></SelectTrigger>
                      <SelectContent>
                        {seksi.map((s) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Nominal (Rp)</Label>
                  <Input type="number" min="0" value={nominal} onChange={(e) => setNominal(e.target.value)} required />
                </div>
                <div>
                  <Label>Keterangan</Label>
                  <Textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} rows={1} />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit">Simpan Transaksi</Button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Transaksi Terbaru</h2>
              <div className="space-y-2">
                {trx.length === 0 && <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>}
                {trx.map((t) => {
                  const namaRef = t.tipe === "pemasukan"
                    ? sumber.find((s) => s.id === t.sumber_donasi_id)?.nama
                    : seksi.find((s) => s.id === t.seksi_id)?.nama;
                  return (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div>
                        <div className="font-medium">{namaRef ?? "-"} <span className="ml-2 text-xs text-muted-foreground">({t.tipe})</span></div>
                        <div className="text-xs text-muted-foreground">{formatTanggal(t.tanggal)} · {t.keterangan ?? "-"}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="tabular-nums font-semibold">{formatRupiah(t.nominal)}</span>
                        <Button size="icon" variant="ghost" onClick={() => delTrx(t.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
