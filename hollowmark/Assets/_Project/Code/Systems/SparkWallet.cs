using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Systems
{
    /// The Warden Spark purse. Static so pickups and shops don't need
    /// scene references; the HUD listens to GameEvents.SparksChanged.
    public static class SparkWallet
    {
        public static int Total { get; private set; }

        public static void Add(int amount)
        {
            if (amount == 0) return;
            Total = Mathf.Max(0, Total + amount);
            GameEvents.RaiseSparksChanged(amount, Total);
        }

        /// Restores a saved balance without a pickup ping.
        public static void Load(int total)
        {
            Total = Mathf.Max(0, total);
            GameEvents.RaiseSparksChanged(0, Total);
        }

        /// Returns true and deducts if affordable (future Oracle purchases).
        public static bool TrySpend(int cost)
        {
            if (cost < 0 || Total < cost) return false;
            Total -= cost;
            GameEvents.RaiseSparksChanged(-cost, Total);
            return true;
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        private static void ResetOnDomainReloadDisabled() => Total = 0;
    }
}
