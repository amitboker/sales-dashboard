/**
 * Hook to fetch the current user's client entity + related data.
 *
 * Linkage: auth user email → clients.email
 * Returns { client, funnel, dataSource, loading, hasData }
 */
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

export default function useClientData() {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("*, funnel:funnels(*), dataSource:data_sources(*)")
          .eq("email", user.email)
          .single();

        if (cancelled) return;

        if (error || !data) {
          // No client row yet — this is expected for brand-new users
          setClient(null);
          setFunnel(null);
          setDataSource(null);
        } else {
          setClient(data);
          setFunnel(data.funnel || null);
          setDataSource(data.dataSource || null);
        }
      } catch {
        // swallow — user simply has no data yet
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user?.email]);

  // hasData = client exists AND has a connected (non-demo) data source
  const hasData =
    !!client &&
    !!dataSource &&
    dataSource.type !== "demo" &&
    !!dataSource.sheetUrl;

  return { client, funnel, dataSource, loading, hasData };
}
