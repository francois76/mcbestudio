export const frameRate = 240;

export const indexUiOptions = {
    path: 'index.html', options: {
        always_accepts_input: false,
        render_game_behind: true,
        absorbs_input: true,
        is_showing_menu: false,
        should_steal_mouse: false,
        force_render_below: false,
        render_only_when_topmost: false
    }
};
export const initUiOptions = {
    path: 'init.html', options: {
        always_accepts_input: false,
        render_game_behind: true,
        absorbs_input: false,
        is_showing_menu: false,
        should_steal_mouse: true,
        force_render_below: true,
        render_only_when_topmost: true
    }
}

export const blankScreenOptions = {
    path: 'blank.html', options: {
        always_accepts_input: false,
        render_game_behind: true,
        absorbs_input: true,
        is_showing_menu: false,
        should_steal_mouse: false,
        force_render_below: false,
        render_only_when_topmost: false
    }
}

export const progressBarOptions = {
    path: 'progressBar.html', options: {
        always_accepts_input: false,
        render_game_behind: true,
        absorbs_input: false,
        is_showing_menu: false,
        should_steal_mouse: true,
        force_render_below: true,
        render_only_when_topmost: true
    }
}

export const wallOffameOptions = {
    path: 'wallOfFame.html', options: {
        always_accepts_input: false,
        render_game_behind: true,
        absorbs_input: true,
        is_showing_menu: false,
        should_steal_mouse: false,
        force_render_below: false,
        render_only_when_topmost: false
    }
}