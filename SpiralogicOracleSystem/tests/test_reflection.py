import pytest
from soul_memory.flows.soul_reflection import soul_reflection

@pytest.mark.asyncio
async def test_soul_reflection_runs():
    result = await soul_reflection()
    assert result is not None  # Adjust this based on expected output
