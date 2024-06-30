use cucumber::{given, World as _};

#[derive(Clone, Copy, Debug, Default, cucumber::World)]
#[world(init = Self::new)]
pub struct World {
}

impl World {
    fn new() -> Self {
        World::default()
    }
}

#[given(regex = "^an empty type-link model is set up$")]
fn empty_model(_world: &mut World) {
}

fn main() {
    futures::executor::block_on(World::run(
        "../tlm-tests/features",
    ));
}
