namespace Hollowmark.Core
{
    public interface IDamageable
    {
        void TakeDamage(in DamageInfo info);
        Faction Faction { get; }
        bool IsDead { get; }
    }
}
