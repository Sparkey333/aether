using UnityEngine;

namespace Hollowmark.Core
{
    /// Global multipliers written by Hollow form (and future pickups),
    /// read by the motor, melee, and Splitfang at point of use.
    public static class PlayerBuffs
    {
        public static float MoveSpeed = 1f;
        public static float MeleeDamage = 1f;
        public static float GunDamage = 1f;
        public static float DamageTaken = 1f;

        public static void ResetAll()
        {
            MoveSpeed = 1f;
            MeleeDamage = 1f;
            GunDamage = 1f;
            DamageTaken = 1f;
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        private static void ResetOnDomainReloadDisabled() => ResetAll();
    }
}
